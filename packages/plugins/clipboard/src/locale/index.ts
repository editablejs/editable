import zhCN from './zh_CN'
import enUS from './en_US'
import { ClipboardLocale } from './types'

const locales: Record<string, ClipboardLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { ClipboardLocale }

export default locales
