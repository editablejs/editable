import zhCN from './zh_CN'
import enUS from './en_US'
import { SideToolbarLocale } from './types'

const locales: Record<string, SideToolbarLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { SideToolbarLocale }

export default locales
