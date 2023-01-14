import zhCN from './zh_CN'
import enUS from './en_US'
import { CodeBlockLocale } from './types'

const locales: Record<string, CodeBlockLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { CodeBlockLocale }

export default locales
