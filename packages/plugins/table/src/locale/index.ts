import zhCN from './zh_CN'
import enUS from './en_US'
import { TableLocale } from './types'

const locales: Record<string, TableLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { TableLocale }

export default locales
