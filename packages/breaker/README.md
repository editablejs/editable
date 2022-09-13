# grapheme-breaker

A JavaScript (ES Module) implementation for web apps, Deno and Node.js of the Unicode 14.0.0 grapheme cluster breaking algorithm ([UAX #29](http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries))

This is a fork of [grapheme-breaker-mjs](https://github.com/taisukef/grapheme-breaker-mjs). Support Unicode 13.0 and emoji v5 by [@taisukef](https://github.com/taisukef)(publishd by [@taisukef](https://github.com/taisukef)). Support Unicode 10.0 and emoji v5 by [@vaskevich](https://github.com/vaskevich)(publishd by [@yumetodo](https://github.com/yumetodo)).  
The base project is [`grapheme-breaker`](https://github.com/foliojs/grapheme-breaker) by [@devongovett](https://github.com/devongovett)

## for Web and Deno

test page  
https://taisukef.github.io/grapheme-breaker-mjs/

```typescript
import { breaks } from '@editablejs/breaker';

console.log(breaks('😜🇺🇸👍')); // => [ '😜', '🇺🇸', '👍' ]
```

## Installation

You can install via npm

    npm i @editablejs/-reaker

## Example

```typescript
import { breaks, countBreaks, nextBreak, previousBreak } from '@editablejs/breaker'

// break a string into an array of grapheme clusters


break('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞') // => ['Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍', 'A̴̵̜̰͔ͫ͗͢', 'L̠ͨͧͩ͘', 'G̴̻͈͍͔̹̑͗̎̅͛́', 'Ǫ̵̹̻̝̳͂̌̌͘', '!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞']


// or just count the number of grapheme clusters in a string


countBreaks('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞') // => 6


// use nextBreak and previousBreak to get break points starting
// from anywhere in the string
nextBreak('😜🇺🇸👍', 3) // => 6
previousBreak('😜🇺🇸👍', 3) // => 2
```

## Development Notes

In order to use the library, you shouldn't need to know this, but if you're interested in contributing or fixing bugs, these things might be of interest.

- The `src/classes.ts` file is generated from `GraphemeBreakProperty.txt` in the Unicode database by `src/generate_data.ts`. It should be rare that you need to run this, but you may if, for instance, you want to change the Unicode version.
- You can run the tests using `pnpm test`. They are written using `jest`, and generated from `GraphemeBreakTest.txt` and `emoji-test.txt` from the Unicode database, which is included in the repository for performance reasons while running them.

## License

MIT
