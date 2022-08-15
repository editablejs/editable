import type { Locale } from '../locale-provider';
import localeData from './en_US.json';

const localeValue: Locale = {
  locale: 'en-US',
  global: {
    locale: 'en-US',
    ...localeData,
  },
};

export default localeValue;
