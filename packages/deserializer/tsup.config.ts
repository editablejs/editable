import { defineConfig } from 'tsup'
import defaultConfig from 'tsup-config'

export default defineConfig(options => ({
  ...(defaultConfig(options) as any),
  entry: ['src/html.ts', 'src/markdown.ts'],
  external: ['mdast'],
}))
