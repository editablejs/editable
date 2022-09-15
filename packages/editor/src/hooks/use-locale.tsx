import merge from 'lodash/merge'
import { useMemo, useContext, createContext } from 'react'
import { Editable } from '../plugin/editable'
import { EDITOR_TO_LANG } from '../utils/weak-maps'
export interface Locale {
  locale: string
}

export const EDITOR_TO_LOCALE: WeakMap<Editable, Record<string, any>> = new WeakMap()
export interface LocaleInterface {
  setLocale: <T extends Locale>(editor: Editable, lang: string, locale: T) => void
  getLang: (editor: Editable) => string
  getLocale: <T extends Locale>(editor: Editable) => T
  getLocales: (editor: Editable) => Record<string, Locale>
}

export const Locale: LocaleInterface = {
  setLocale(editor, lang, locale) {
    const locales = Locale.getLocales(editor)
    locales[lang] = merge(locales[lang], locale)
    EDITOR_TO_LOCALE.set(editor, locales)
  },

  getLang(editor) {
    return EDITOR_TO_LANG.get(editor) || 'en-US'
  },

  getLocale(editor) {
    const lang = Locale.getLang(editor)
    const locales = Locale.getLocales(editor)
    return locales[lang] as any
  },

  getLocales(editor) {
    return EDITOR_TO_LOCALE.get(editor) || {}
  },
}

export const LocaleContext = createContext<Partial<Locale>>({} as any)

export type LocaleComponentName = Exclude<keyof Locale, 'locale'>

export const useLocale = <T extends LocaleComponentName>(
  componentName: T,
  defaultLocale?: Locale[T] | Function,
): [Locale[T]] => {
  const localeContext = useContext(LocaleContext) ?? {}
  const componentLocaleContext = localeContext[componentName]

  const componentLocale = useMemo(() => {
    const locale = componentLocaleContext || defaultLocale

    return {
      ...(typeof locale === 'function' ? locale() : locale),
    }
  }, [defaultLocale, componentLocaleContext])

  return [componentLocale]
}
