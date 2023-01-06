import zhCN from './zh_CN'
import enUS from './en_US'
import { ToolbarLocale } from './types'

const locales: Record<string, ToolbarLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { ToolbarLocale }

export default locales
