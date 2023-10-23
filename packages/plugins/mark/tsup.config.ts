import { defineConfig } from 'tsup'
import defaultConfig from 'tsup-config/tsup.emotion.config.js'

export default defineConfig(options => ({
  ...(defaultConfig(options) as any)
}))
