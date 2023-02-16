import { defineConfig } from 'tsup'
import defaultConfig from 'tsup-config'

export default defineConfig(options => ({
  ...(defaultConfig(options) as any),
  entry: [
    'src/background-color/index.ts',
    'src/background-color/serializer/html.ts',
    'src/background-color/deserializer/html.ts',
    'src/color/index.ts',
    'src/color/serializer/html.ts',
    'src/color/deserializer/html.ts',
    'src/size/index.ts',
    'src/size/serializer/html.ts',
    'src/size/deserializer/html.ts',
  ],
}))
