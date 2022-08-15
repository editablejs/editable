import type { Locale } from '../locale-provider';
import localeData from './zh_CN.json';

const localeValue: Locale = {
  locale: 'zh-CN',
  global: {
    locale: 'zh-CN',
    ...localeData,
  },
};

export default localeValue;
