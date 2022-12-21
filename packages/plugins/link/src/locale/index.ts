import zhCN from './zh_CN'
import enUS from './en_US'
import { LinkLocale } from './types'

const locales: Record<string, LinkLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { LinkLocale }

export default locales
