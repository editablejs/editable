import React from 'react';
import LocaleContext from './context';
import { useLocaleReceiver } from './locale-receiver';

export interface Locale {
  locale: string;
  global: {
    locale: string;
  };
}

export interface LocaleProviderProps {
  locale: Locale;
  children?: React.ReactNode;
}

const LocaleProvider = ({ locale, children }: LocaleProviderProps) => {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
};

export { useLocaleReceiver };

export default LocaleProvider
