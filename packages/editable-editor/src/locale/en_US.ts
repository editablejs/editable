import { Locale } from '../hooks/use-locale';
import localeData from './en_US.json';

const localeValue: Locale = {
  locale: 'en-US',
  global: {
    locale: 'en-US',
    ...localeData,
  },
};

export default localeValue;
