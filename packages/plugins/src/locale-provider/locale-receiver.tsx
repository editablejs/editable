import { useMemo, useContext } from 'react';
import type { Locale } from '.';
import LocaleContext from './context';
import defaultData from '../locale/en_US';

export type LocaleComponentName = Exclude<keyof Locale, 'locale'>;
export function useLocaleReceiver<T extends LocaleComponentName>(
  componentName: T,
  defaultLocale?: Locale[T] | Function,
): [Locale[T]] {
  
  const localeContext = useContext(LocaleContext) ?? {}
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
