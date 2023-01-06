import zhCN from './zh_CN'
import enUS from './en_US'
import { SideToolbarLocale } from './types'

const locale: Record<string, SideToolbarLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export type { SideToolbarLocale }

export default locale
