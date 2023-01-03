import zhCN from './zh_CN'
import enUS from './en_US'
import { ImageLocale } from './types'

const locales: Record<string, ImageLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { ImageLocale }

export default locales
