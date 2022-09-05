import { Locale } from '../hooks/use-locale';
import localeData from './zh_TW.json';

const localeValue: Locale = {
  locale: 'zh-TW',
  global: {
    locale: 'zh-TW',
    ...localeData,
  },
};

export default localeValue;
