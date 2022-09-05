import zhCN from './zh_CN';
import zhTW from './zh_TW';
import enUS from './en_US';
import jaJP from './ja_JP';
import { Locale } from '../hooks/use-locale';

export const locales: Record<string, Locale> = { 
  'en-US': enUS,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'ja-JP': jaJP,
}