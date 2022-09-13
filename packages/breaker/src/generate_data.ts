import fs from 'fs';
import fetch from 'node-fetch';
import UnicodeTrieBuilder from 'unicode-trie/builder';

//v10.0.0
//{"Other":0,"Prepend":1,"CR":2,"LF":3,"Control":4,"Extend":5,"Regional_Indicator":6,"SpacingMark":7,"L":8,"V":9,"T":10,"LV":11,"LVT":12,"E_Base":13,"E_Modifier":14,"ZWJ":15,"Glue_After_Zwj":16,"E_Base_GAZ":17}}
//v13.0.0
//{"Other":0,"Prepend":1,"CR":2,"LF":3,"Control":4,"Extend":5,"Regional_Indicator":6,"SpacingMark":7,"L":8,"V":9,"T":10,"LV":11,"LVT":12,"ZWJ":13}}

/*
//const s = "F2139          ; Extended_Pictographic# E0.6   [1] (ℹ️)       information"
const s = "2194..2199    ; Extended_Pictographic# E0.6   [6] (↔️..↙️)    left-right arrow..down-left arrow"
const re = /^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s*;\s*([A-Za-z_]+)/
//const re = /^([0-9A-F]+)\s*;\s*([A-Za-z_]+)/
console.log(s.match(re))
process.exit(0)
*/
const main = async () => {
  const UNICODE_VERSION = '14.0.0';

  let nextClass = 1;
  const classes: Record<string, number> = { Other: 0 };
  const trie = new UnicodeTrieBuilder(classes.Other, 0);

  // collect entries in the table into ranges to keep things smaller.
  {
    const url = `https://www.unicode.org/Public/${UNICODE_VERSION}/ucd/auxiliary/GraphemeBreakProperty.txt`;
    const data = await (await fetch(url)).text();
    let match: RegExpExecArray | null = null;
    const re = /^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s*;\s*([A-Za-z_]+)/gm;
    match = re.exec(data);
    while (match) {
      const start = match[1];
      const end = match[2] ? match[2] : start;
      const type = match[3];
      if (classes[type] == null) {
        classes[type] = nextClass++;
      }
      trie.setRange(parseInt(start, 16), parseInt(end, 16), classes[type]);
      match = re.exec(data);
    }
  }

  const extpict = nextClass;
  classes['ExtPict'] = nextClass++;
  {
    //const url = 'https://www.unicode.org/Public/13.0.0/ucd/emoji/emoji-data.txt' // Date: 2020-01-28, 20:52:38 GMT
    const url = 'https://www.unicode.org/Public/UCD/latest/ucd/emoji/emoji-data.txt'; // Date: 2020-01-28, 20:52:38 GMT
    const data = await (await fetch(url)).text();
    let match: RegExpExecArray | null = null;
    const re = /^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s*;\s*([A-Za-z_]+)/gm;
    match = re.exec(data);
    while (match) {
      const start = match[1];
      const end = match[2] ? match[2] : start;
      const type = match[3];
      if (type === 'Extended_Pictographic') {
        trie.setRange(parseInt(start, 16), parseInt(end, 16), extpict);
      }
      match = re.exec(data);
    }
  }

  const output = { trie: trie.toBuffer().toString('base64'), classes };
  // write the trie and classes to a file
  fs.writeFileSync(
    `src/classes-v${UNICODE_VERSION}.ts`,
    `const data = ${JSON.stringify(output)};\nexport default data;`,
  );

  const key = [];
  for (const n in classes) {
    key.push(n);
  }
  console.log(`const { ${key.join(', ')}} = classes-v${UNICODE_VERSION}.classes`);
};
main();
