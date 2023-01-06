import zhCN from './zh_CN'
import enUS from './en_US'
import { HrLocale } from './types'

const locales: Record<string, HrLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { HrLocale }

export default locales
