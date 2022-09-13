import { Locale } from '../hooks/use-locale'
import localeData from './zh_CN.json'

const localeValue: Locale = {
  locale: 'zh-CN',
  global: {
    locale: 'zh-CN',
    ...localeData,
  },
}

export default localeValue
