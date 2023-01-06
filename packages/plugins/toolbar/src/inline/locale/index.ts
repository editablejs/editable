import zhCN from './zh_CN'
import enUS from './en_US'
import { InlineToolbarLocale } from './types'

const locales: Record<string, InlineToolbarLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { InlineToolbarLocale }

export default locales
