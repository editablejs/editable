import UnicodeTrie from 'unicode-trie';

const { trie, classes } = {
  trie: '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',
  classes: {
    Other: 0,
    Prepend: 1,
    CR: 2,
    LF: 3,
    Control: 4,
    Extend: 5,
    Regional_Indicator: 6,
    SpacingMark: 7,
    L: 8,
    V: 9,
    T: 10,
    LV: 11,
    LVT: 12,
    ZWJ: 13,
    ExtPict: 14,
  },
};

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
