import { breaks, nextBreak, previousBreak, countBreaks } from '../index';
import fs from 'fs';
import punycode from 'punycode';

describe('GraphemeBreaker', () => {
  it('basic test', () => {
    const broken = breaks('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞');
    return expect(broken).toEqual(['Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍', 'A̴̵̜̰͔ͫ͗͢', 'L̠ͨͧͩ͘', 'G̴̻͈͍͔̹̑͗̎̅͛́', 'Ǫ̵̹̻̝̳͂̌̌͘', '!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞']);
  });
  it('nextBreak', () => {
    let brk: number, index: number, res: string[], str: string;
    str = 'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞';
    index = 0;
    res = [];
    while ((brk = nextBreak(str, index)) < str.length) {
      res.push(str.slice(index, brk));
      index = brk;
    }
    res.push(str.slice(index));
    return expect(res).toEqual(['Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍', 'A̴̵̜̰͔ͫ͗͢', 'L̠ͨͧͩ͘', 'G̴̻͈͍͔̹̑͗̎̅͛́', 'Ǫ̵̹̻̝̳͂̌̌͘', '!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞']);
  });
  it('nextBreak intermediate indexes', () => {
    let breaks: Record<string, number>, brk: number, i: number, j: number, ref: number, str: string;
    str = 'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞';
    breaks = {};
    for (i = j = -1, ref = str.length; j < ref; i = j += 1) {
      brk = nextBreak(str, i);
      breaks[brk] = brk;
    }
    return expect(
      Object.keys(breaks).map(b => {
        return breaks[b];
      }),
    ).toEqual([0, 19, 28, 34, 47, 58, 75]);
  });
  it('previousBreak', () => {
    let brk: number, index: number, res: string[], str: string;
    str = 'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞';
    index = str.length;
    res = [];
    while ((brk = previousBreak(str, index)) > 0) {
      res.push(str.slice(brk, index));
      index = brk;
    }
    res.push(str.slice(0, index));
    return expect(res).toEqual(['Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍', 'A̴̵̜̰͔ͫ͗͢', 'L̠ͨͧͩ͘', 'G̴̻͈͍͔̹̑͗̎̅͛́', 'Ǫ̵̹̻̝̳͂̌̌͘', '!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞'].reverse());
  });
  it('previousBreak intermediate indexes', () => {
    let breaks: Record<string, number>, brk: number, i: number, j: number, str: string;
    str = 'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞';
    breaks = {};
    for (i = j = str.length + 1; j >= 0; i = j += -1) {
      brk = previousBreak(str, i);
      breaks[brk] = brk;
    }
    return expect(
      Object.keys(breaks).map(b => {
        return breaks[b];
      }),
    ).toEqual([0, 19, 28, 34, 47, 58, 75]);
  });
  it('previousBreak handles astral characters (e.g. emoji)', () => {
    let brk: number, index: number, res: string[], str: string;
    str = '👩‍❤️‍👩😜🇺🇸👍🏻';
    res = [];
    index = str.length;
    while ((brk = previousBreak(str, index)) > 0) {
      res.push(str.slice(brk, index));
      index = brk;
    }
    res.push(str.slice(0, index));
    return expect(res).toEqual(['👍🏻', '🇺🇸', '😜', '👩‍❤️‍👩']);
  });
  it('nextBreak handles astral characters (e.g. emoji)', () => {
    let brk: number, index: number, res: string[], str: string;
    str = '👩‍❤️‍👩😜🇺🇸👍🏻';
    res = [];
    index = 0;
    while ((brk = nextBreak(str, index)) < str.length) {
      res.push(str.slice(index, brk));
      index = brk;
    }
    res.push(str.slice(index));
    return expect(res).toEqual(['👩‍❤️‍👩', '😜', '🇺🇸', '👍🏻']);
  });
  it('should pass all tests in GraphemeBreakTest.txt', () => {
    let codePoints: number[],
      cols: string,
      data: string,
      expected: string[],
      j: number,
      len: number,
      line: string,
      lines: string[],
      str: string;
    data = fs.readFileSync(__dirname + '/GraphemeBreakTest-14.0.0.txt', 'utf8');
    lines = data.split('\n');
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      if (!line || /^#/.test(line)) {
        continue;
      }
      [cols] = line.split('#');
      codePoints = cols
        .split(/\s*[×÷]\s*/)
        .filter(Boolean)
        .map(c => {
          return parseInt(c, 16);
        });
      str = punycode.ucs2.encode(codePoints);
      expected = cols
        .split(/\s*÷\s*/)
        .filter(Boolean)
        .map(c => {
          let codes: number[];
          codes = c.split(/\s*×\s*/).map(c => {
            return parseInt(c, 16);
          });
          return punycode.ucs2.encode(codes);
        });
      expect(breaks(str)).toEqual(expected);
      expect(countBreaks(str)).toBe(expected.length);
    }
  });
  it('should pass all tests in GraphemeBreakTest.txt in reverse', () => {
    let brk: number,
      codePoints: number[],
      cols: string,
      data: string,
      expected: string[],
      index: number,
      j: number,
      len: number,
      line: string,
      lines: string[],
      res: string[],
      str: string;
    data = fs.readFileSync(__dirname + '/GraphemeBreakTest-14.0.0.txt', 'utf8');
    lines = data.split('\n');
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      if (!line || /^#/.test(line)) {
        continue;
      }
      [cols] = line.split('#');
      codePoints = cols
        .split(/\s*[×÷]\s*/)
        .filter(Boolean)
        .map(c => {
          return parseInt(c, 16);
        });
      str = punycode.ucs2.encode(codePoints);
      expected = cols
        .split(/\s*÷\s*/)
        .filter(Boolean)
        .map(c => {
          let codes: number[];
          codes = c.split(/\s*×\s*/).map(c => {
            return parseInt(c, 16);
          });
          return punycode.ucs2.encode(codes);
        });
      res = [];
      index = str.length;
      while ((brk = previousBreak(str, index)) > 0) {
        res.push(str.slice(brk, index));
        index = brk;
      }
      res.push(str.slice(0, index));
      expect(res).toEqual(expected.reverse());
    }
  });
  it('should pass all tests in emoji-test.txt', () => {
    let codePoints: number[],
      cols: string,
      data: string,
      j: number,
      len: number,
      line: string,
      lines: string[],
      str: string;
    data = fs.readFileSync(__dirname + '/emoji-test.txt', 'utf8');
    lines = data.split(/\r\n|\n/);
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      if (!line || /^#/.test(line)) {
        continue;
      }
      [cols] = line.split(';');
      codePoints = cols
        .split(/\s+/)
        .filter(Boolean)
        .map(c => {
          return parseInt(c, 16);
        });
      str = punycode.ucs2.encode(codePoints);
      expect(breaks(str)).toEqual([str]);
      expect(countBreaks(str)).toBe(1);
      expect(nextBreak(str)).toBe(str.length);
    }
  });
  return it('should pass all tests in emoji-test.txt in reverse', () => {
    let codePoints: number[],
      cols: string,
      data: string,
      j: number,
      len: number,
      line: string,
      lines: string[],
      str: string;
    data = fs.readFileSync(__dirname + '/emoji-test.txt', 'utf8');
    lines = data.split(/\r\n|\n/);
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      if (!line || /^#/.test(line)) {
        continue;
      }
      [cols] = line.split(';');

      codePoints = cols
        .split(/\s+/)
        .filter(Boolean)
        .map(c => {
          return parseInt(c, 16);
        });
      str = punycode.ucs2.encode(codePoints);
      expect(breaks(str)).toEqual(str.length === 0 ? [] : [str]);
      expect(countBreaks(str)).toBe(1);
      expect(previousBreak(str, str.length)).toBe(0);
    }
  });
});
