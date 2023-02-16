import { defineConfig } from 'tsup'
import defaultConfig from 'tsup-config'

export default defineConfig(options => ({
  ...(defaultConfig(options) as any),
  entry: ['src/index.ts', 'src/inline/index.ts', 'src/side/index.ts', 'src/slash/index.ts'],
}))
