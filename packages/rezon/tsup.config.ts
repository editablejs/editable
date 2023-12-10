import { defineConfig } from 'tsup'
import defaultConfig from 'tsup-config'

export default defineConfig(options => ({
  ...(defaultConfig(options) as any),
  entry: ['src/index.ts',
    'src/directives/async-append.ts',
    'src/directives/async-replace.ts',
    'src/directives/cache.ts',
    'src/directives/choose.ts',
    'src/directives/class-map.ts',
    'src/directives/guard.ts',
    'src/directives/if-defined.ts',
    'src/directives/join.ts',
    'src/directives/keyed.ts',
    'src/directives/live.ts',
    'src/directives/map.ts',
    'src/directives/range.ts',
    'src/directives/ref.ts',
    'src/directives/repeat.ts',
    'src/directives/spread.ts',
    'src/directives/style-map.ts',
    'src/directives/template-content.ts',
    'src/directives/unsafe-html.ts',
    'src/directives/unsafe-svg.ts',
    'src/directives/until.ts',
    'src/directives/when.ts',
  ],
}))
