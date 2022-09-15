import zhCN from './zh_CN'
import enUS from './en_US'
import { GlobalLocale } from './types'

const locales: Record<string, GlobalLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { GlobalLocale }

export default locales
