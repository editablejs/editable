import { Options, defineConfig } from 'tsup'
import config from 'tsup-config/rezon.config.js'

export default defineConfig(() => ({
  ...config() as Options,
  entry: [
    'src/index.ts',
    'src/shallow.ts',
    'src/deep-equal.ts'
  ],
}))
