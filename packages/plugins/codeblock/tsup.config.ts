import { defineConfig } from 'tsup'
import defaultConfig from 'tsup-config'

export default defineConfig(options => ({
  ...(defaultConfig(options) as any),
  entry: [
    'src/index.ts',
    'src/yjs.ts',
    'src/serializer/html.ts',
    'src/serializer/text.ts',
    'src/serializer/markdown.ts',
    'src/deserializer/html.ts',
    'src/deserializer/markdown.ts',
  ],
}))
