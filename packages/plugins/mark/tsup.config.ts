import { defineConfig } from 'tsup'
import defaultConfig from 'tsup-config'

export default defineConfig(options => ({
  ...(defaultConfig(options) as any),
  entry: [
    'src/index.tsx',
    'src/serializer/html.ts',
    'src/serializer/markdown.ts',
    'src/deserializer/html.ts',
    'src/deserializer/markdown.ts',
  ],
}))
