import { Options, defineConfig } from 'tsup'
import defaultConfig from 'tsup-config/rezon.config.js'

export default defineConfig(() => ({
  ...(defaultConfig() as Options),
}))
