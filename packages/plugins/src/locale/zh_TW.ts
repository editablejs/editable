import type { Locale } from '../locale-provider';
import localeData from './zh_TW.json';

const localeValue: Locale = {
  locale: 'zh-TW',
  global: {
    locale: 'zh-TW',
    ...localeData,
  },
};

export default localeValue;
