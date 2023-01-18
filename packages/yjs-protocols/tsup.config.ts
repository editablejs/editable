import { defineConfig } from 'tsup'
import defaultConfig from 'tsup-config'

export default defineConfig(options => ({
  ...(defaultConfig(options) as any),
  entry: ['src/sync.ts', 'src/awareness.ts', 'src/awareness-selection.ts', 'src/auth.ts'],
}))
