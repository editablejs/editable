import merge from 'lodash/merge';
import { useMemo, useContext, createContext } from 'react';
import { locales } from '../locale'
import defaultData from '../locale/en_US';

export interface Locale {
  locale: string;
  global: {
    locale: string;
  };
}

export interface LocaleInterface { 
  set: <T extends Locale>(lang: string, locale: T) => void
  get: <T extends Locale>(lang: string) => T
  getLocales: () => Record<string, Locale>
}

export const Locale: LocaleInterface = {
  
  set(lang, locale) {
    locales[lang] = merge(locales[lang], locale);
  },

  get(lang) {
    return locales[lang] as any;
  },

  getLocales() { 
    return locales
  }
}

export interface LocaleContext {
  locale: Partial<Locale>;
  getPrefixCls: (suffixCls?: string, customizePrefixCls?: string) => string;
}

export const LocaleContext = createContext<LocaleContext>({} as any);

export type LocaleComponentName = Exclude<keyof Locale, 'locale'>;

export const useLocale = <T extends LocaleComponentName>(
  componentName: T,
  defaultLocale?: Locale[T] | Function,
): [Locale[T]] => {
  
  const { locale: localeContext } = useContext(LocaleContext) ?? {}
  const componentLocaleContext = localeContext[componentName]

  const componentLocale = useMemo(() => {
    const locale =
      componentLocaleContext ||
      defaultLocale ||
      defaultData[componentName || 'global'];

    return {
      ...(typeof locale === 'function' ? locale() : locale),
    };
  }, [componentName, defaultLocale, componentLocaleContext]);

  return [componentLocale];
}