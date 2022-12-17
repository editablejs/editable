import * as React from 'react'
import { useStore } from 'zustand'
import { Editable } from '../plugin/editable'
import { Locale, LocaleComponentName } from '../plugin/locale'
import { useEditableStatic } from './use-editable'

export const useLocaleStore = (editor: Editable) => {
  return React.useMemo(() => {
    return Locale.getStore(editor)
  }, [editor])
}

export const useLang = (editor: Editable): string => {
  const store = useLocaleStore(editor)
  return useStore(store, state => state.lang)
}

export const useLocale = <
  L extends Locale,
  T extends LocaleComponentName<L> = LocaleComponentName<L>,
>(
  componentName: T,
  defaultLocale?: L[T] | (() => L[T]),
): L[T] => {
  const editor = useEditableStatic()
  const lang = useLang(editor)
  const localeContext = useLocales<L>(editor, lang)
  const componentLocaleContext = localeContext[componentName]

  const componentLocale = React.useMemo(() => {
    const locale = componentLocaleContext || defaultLocale
    return {
      ...(locale instanceof Function ? locale() : locale),
    } as L[T]
  }, [defaultLocale, componentLocaleContext])

  return componentLocale
}

export const useLocales = <T extends Locale>(editor: Editable, lang: string): T => {
  const store = useLocaleStore(editor)

  const locales = useStore(store, state => state.locales[lang] ?? state.locales['en-US'])
  return locales as T
}

export const useLocaleFormat = <
  L extends Locale,
  T extends LocaleComponentName<L> = LocaleComponentName<L>,
>(
  componentName: T,
) => {
  const locale = useLocale<L>(componentName)
  return {
    format: (key: keyof typeof locale, options?: Record<string, string | number>) => {
      const value = locale[key]
      if (typeof value === 'string') {
        if (!options) return value
        return value.replace(/{(\w+)}/g, (match, key) => String(options[key]) || match)
      }
      return ''
    },
  }
}
