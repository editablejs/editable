import { defineConfig } from 'tsup'
import defaultConfig from 'tsup-config'

export default defineConfig(options => ({
  ...(defaultConfig(options) as any),
  entry: ['src/index.tsx', 'src/yjs.ts', 'src/serializer.ts', 'src/deserializer.ts'],
}))
