import { defineConfig } from 'tsup'
import defaultConfig from 'tsup-config'

export default defineConfig(options => ({
  ...(defaultConfig(options) as any),
  entry: ['src/index.ts',
    'src/vanilla.ts',
    'src/shallow.ts',
    'src/use-sync-external-store-with-selector.ts',
    'src/use-sync-external-store.ts'
  ],
  esbuildOptions(options) {
    options.external = ['rezon']
  },
}))
