
import { Locale } from '../hooks/use-locale';
import localeData from './ja_JP.json';

const localeValue: Locale = {
  locale: 'ja-JP',
  global: {
    locale: 'ja-JP',
    ...localeData,
  },
};

export default localeValue;
