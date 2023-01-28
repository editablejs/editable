import zhCN from './zh_CN'
import enUS from './en_US'
import { ContextMenuItems } from './types'

const locales: Record<string, ContextMenuItems> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { ContextMenuItems }

export default locales
