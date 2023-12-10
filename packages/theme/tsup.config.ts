import { Options, defineConfig } from 'tsup'
import config from 'tsup-config/rezon.config.js'

export default defineConfig(() => ({
  ...config() as Options,
  entry: [
    'src/index.ts',
    'src/components/icon',
    'src/components/button',
    'src/components/dropdown',
    'src/components/toolbar',
    'src/components/context-menu',
    'src/components/tooltip',
    'src/components/popover',
    'src/components/portal',
    'src/components/menu',
    'src/components/slot',
    'src/components/direction',
    'src/components/switch',
    'src/components/color-picker',
    'src/components/resizer',
    'src/components/scroll-area',
    'src/components/avatar',
    'src/components/select',
    'src/hooks/use-callback-ref',
    'src/hooks/use-escape-keydown',
    'src/hooks/use-id',
    'src/hooks/use-rect',
    'src/hooks/use-size',
    'src/hooks/use-controllable-state',
    'src/hooks/use-previous',
    'src/hooks/use-file-picker',
    'src/hooks/use-isomorphic-layout-effect'
  ],
}))
