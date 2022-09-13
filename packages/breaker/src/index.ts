import UnicodeTrie from 'unicode-trie';
import classesmjs from './classes-v13.0.0';
const { trie, classes } = classesmjs;
const {
  Other,
  Prepend,
  CR,
  LF,
  Control,
  Extend,
  Regional_Indicator,
  SpacingMark,
  L,
  V,
  T,
  LV,
  LVT,
  ZWJ,
  ExtPict,
} = classes;

let data = null;
if (globalThis['window']) {
  const bin = window.atob(trie);
  data = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
} else {
  data = Buffer.from(trie, 'base64');
}
//console.log(data, data.length)
const classTrie = new UnicodeTrie(data);

const codePointAt = (str: string, idx: number) => {
  // different from String#codePointAt with low surrogate
  const code = str.charCodeAt(idx);
  // High surrogate
  if (0xd800 <= code && code <= 0xdbff) {
    const hi = code;
    const low = str.charCodeAt(idx + 1);
    if (0xdc00 <= low && low <= 0xdfff) {
      return (hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
    }
    return hi;
  }
  // Low surrogate
  if (0xdc00 <= code && code <= 0xdfff) {
    const hi = str.charCodeAt(idx - 1);
    const low = code;
    if (0xd800 <= hi && hi <= 0xdbff) {
      return (hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
    }
    return low;
  }
  return code;
};

const isSurrogate = (str: string, pos: number) => {
  let ref, ref1;
  return (
    0xd800 <= (ref = str.charCodeAt(pos)) &&
    ref <= 0xdbff &&
    0xdc00 <= (ref1 = str.charCodeAt(pos + 1)) &&
    ref1 <= 0xdfff
  );
};

const BreakType = {
  NotBreak: 0,
  BreakStart: 1,
  Break: 2,
  BreakLastRegional: 3,
  BreakPenultimateRegional: 4,
};

// Returns whether a break is allowed within a sequence of grapheme breaking classes
const shouldBreak = (reverse: boolean, start: number, mid: number[], end: number) => {
  const all = [start].concat(mid).concat([end]);
  const previous = reverse ? start : all[all.length - 2];
  const next = reverse ? all[1] : end;

  // Lookahead terminator for:
  // GB12. ^ (RI RI)* RI	×	RI
  // GB13. [^RI] (RI RI)* RI	×	RI
  let rIIndex = all.lastIndexOf(Regional_Indicator);
  if (
    rIIndex > 0 &&
    all.slice(1, rIIndex).every(c => c === Regional_Indicator) &&
    previous !== Prepend &&
    previous !== Regional_Indicator
  ) {
    if (all.filter(c => c === Regional_Indicator).length % 2 === 1) {
      return BreakType.BreakLastRegional;
    } else {
      return BreakType.BreakPenultimateRegional;
    }
  }
  // GB3. CR X LF
  if (previous === CR && next === LF) {
    return BreakType.NotBreak;
  }
  // GB4. (Control|CR|LF) ÷
  if (previous === Control || previous === CR || previous === LF) {
    //return BreakType.BreakStart
    if (next !== Extend && mid.every(c => c === Extend)) {
      return BreakType.Break;
    } else {
      return BreakType.BreakStart;
    }
  }
  // GB5. ÷ (Control|CR|LF)
  if (next === Control || next === CR || next === LF) {
    return BreakType.BreakStart;
  }
  // GB6. L X (L|V|LV|LVT)
  if (previous === L && (next === L || next === V || next === LV || next === LVT)) {
    return BreakType.NotBreak;
  }
  // GB7. (LV|V) X (V|T)
  if ((previous === LV || previous === V) && (next === V || next === T)) {
    return BreakType.NotBreak;
  }
  // GB8. (LVT|T) X (T)
  if ((previous === LVT || previous === T) && next === T) {
    return BreakType.NotBreak;
  }
  // GB9.0 X (Extend|ZWJ)
  if (reverse) {
    if (next === Extend) {
      return BreakType.NotBreak;
    }
    if (next === ZWJ) {
      if (previous === Other && mid.length > 0 && mid[0] === ZWJ) {
        return end !== ExtPict ? BreakType.BreakStart : BreakType.Break;
      }
      return BreakType.NotBreak;
    }
  } else {
    if (next === Extend || next === ZWJ) {
      return BreakType.NotBreak;
    }
  }
  // GB9.1 X SpacingMark
  if (next === SpacingMark) {
    return BreakType.NotBreak;
  }
  // GB9.2 Prepend X
  if (previous === Prepend) {
    return BreakType.NotBreak;
  }
  // GB11.0 ExtPict Extend * ZWJ	×	ExtPict
  if (reverse) {
    if (previous === ZWJ && next === ExtPict && (start === ZWJ || start === Other)) {
      return BreakType.NotBreak;
    }
  } else {
    if (start === ExtPict && previous === ZWJ && next === ExtPict) {
      return BreakType.NotBreak;
    }
  }

  // GB12. ^ (RI RI)* RI	×	RI
  // GB13. [^RI] (RI RI)* RI	×	RI
  if (!reverse && mid.indexOf(Regional_Indicator) >= 0) {
    return BreakType.Break;
  }
  if (previous === Regional_Indicator && next === Regional_Indicator) {
    return BreakType.NotBreak;
  }
  // GB999. Any ÷ Any
  return BreakType.BreakStart;
};

const getUnicodeByteOffset = (str: string, start: number, unicodeOffset: number) => {
  while (unicodeOffset--) {
    start += isSurrogate(str, start) ? 2 : 1;
  }
  return start;
};

// Returns the next grapheme break in the string after the given index
export const nextBreak = (string: string, index = 0) => {
  if (index < 0) {
    return 0;
  }
  if (index >= string.length - 1) {
    return string.length;
  }
  const prev = classTrie.get(string.codePointAt(index) ?? -1);
  const mid = [];
  let i, j, ref1;
  for (i = j = index + 1, ref1 = string.length; j < ref1; i = j += 1) {
    if (isSurrogate(string, i - 1)) {
      // check for already processed low surrogates
      continue;
    }
    const next = classTrie.get(string.codePointAt(i) ?? -1);
    if (shouldBreak(false, prev, mid, next)) {
      return i;
    }
    mid.push(next);
  }
  return string.length;
};

// Returns the next grapheme break in the string before the given index
export const previousBreak = (string: string, index = string.length) => {
  if (index > string.length) {
    return string.length;
  }
  if (index <= 1) {
    return 0;
  }
  index--;
  let mid = [];
  let next = classTrie.get(codePointAt(string, index));
  let i, j;
  for (i = j = index - 1; j >= -1; i = j += -1) {
    if (isSurrogate(string, i)) {
      // check for already processed high surrogates
      continue;
    }
    let prev = classTrie.get(codePointAt(string, i));
    switch (shouldBreak(true, prev, mid, next)) {
      case BreakType.Break:
        return i + mid.length + 1;
      case BreakType.BreakStart:
        return i + 1;
      case BreakType.BreakLastRegional:
        const offset = getUnicodeByteOffset(
          string,
          i,
          mid.concat(next).lastIndexOf(Regional_Indicator) + 1,
        );
        return offset;
      case BreakType.BreakPenultimateRegional:
        return getUnicodeByteOffset(string, i, mid.concat(next).lastIndexOf(Regional_Indicator));
    }
    mid.unshift(prev);
  }
  return -1;
};

// Breaks the given string into an array of grapheme cluster strings
export const breaks = (str: string) => {
  const res = [];
  let index = 0;
  let brk;
  while ((brk = nextBreak(str, index)) < str.length) {
    res.push(str.slice(index, brk));
    index = brk;
  }
  if (index < str.length) {
    res.push(str.slice(index));
  }
  return res;
};

// Returns the number of grapheme clusters there are in the given string
export const countBreaks = (str: string) => {
  let count = 0;
  let index = 0;
  let brk;
  while ((brk = nextBreak(str, index)) < str.length) {
    index = brk;
    count++;
  }
  if (index < str.length) {
    count++;
  }
  return count;
};
