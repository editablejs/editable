import { defineConfig } from 'tsup'
import defaultConfig from 'tsup-config'

export default defineConfig(options => ({
  ...(defaultConfig(options) as any),
  entry: ['src/index.ts', 'src/server.ts'],
  esbuildOptions(options) {
    options.external = ['ws', 'y-leveldb']
  },
}))
