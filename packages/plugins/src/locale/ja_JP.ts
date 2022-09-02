import type { Locale } from '../locale-provider';
import localeData from './ja_JP.json';

const localeValue: Locale = {
  locale: 'ja-JP',
  global: {
    locale: 'ja-JP',
    ...localeData,
  },
};

export default localeValue;
