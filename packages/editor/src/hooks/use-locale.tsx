import merge from 'lodash.merge'
import { useMemo } from 'react'
import create, { StoreApi, UseBoundStore } from 'zustand'
import { Editable } from '../plugin/editable'
import { useEditableStatic } from './use-editable-static'
export interface Locale {
  locale: string
}

interface LocaleState {
  lang: string
  locales: Record<string, Locale>
}

const EDITOR_TO_LOCALE_STORE: WeakMap<
  Editable,
  UseBoundStore<StoreApi<LocaleState>>
> = new WeakMap()
export interface LocaleStore {
  /**
   * 设置多语言资源包
   */
  setLocale: <T extends Locale>(editor: Editable, lang: string, locale: T) => void
  /**
   * 获取当前编辑器语言
   */
  getLang: (editor: Editable) => string
  /**
   * 设置当前编辑器语言
   */
  setLang: (editor: Editable, lang: string) => void
  /**
   * 获取当前语言的多语言资源包
   */
  getLocale: <T extends Locale>(editor: Editable) => T
  /**
   * 获取所有语言的多语言资源包
   */
  getLocales: (editor: Editable) => Record<string, Locale>
}

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_LOCALE_STORE.get(editor)
  if (!store) {
    store = create<LocaleState>(() => ({
      lang: 'en-US',
      locales: {},
    }))
    EDITOR_TO_LOCALE_STORE.set(editor, store)
  }
  return store
}

export const LocaleStore: LocaleStore = {
  setLocale(editor, lang, locale) {
    const store = getStore(editor)
    store.setState(state => {
      return {
        lang: state.lang,
        locales: {
          ...state.locales,
          [lang]: merge(state.locales[lang], locale),
        },
      }
    })
  },

  getLang(editor) {
    const state = getStore(editor).getState()
    return state.lang
  },

  setLang(editor, lang) {
    const store = getStore(editor)
    store.setState(state => {
      return {
        lang,
        locales: state.locales,
      }
    })
  },

  getLocale(editor) {
    const lang = LocaleStore.getLang(editor)
    const locales = LocaleStore.getLocales(editor)
    return locales[lang] as any
  },

  getLocales(editor) {
    const state = getStore(editor).getState()
    return state.locales
  },
}

export type LocaleComponentName<T extends Locale> = Exclude<keyof T, 'locale'>

export const useLang = (editor: Editable): string => {
  return useMemo(() => {
    return getStore(editor).getState().lang
  }, [editor])
}

export const useLocale = <
  L extends Locale,
  T extends LocaleComponentName<L> = LocaleComponentName<L>,
>(
  componentName: T,
  defaultLocale?: L[T] | (() => L[T]),
): [L[T]] => {
  const editor = useEditableStatic()
  const lang = useLang(editor)
  const localeContext = useLocales<L>(editor, lang)
  const componentLocaleContext = localeContext[componentName]

  const componentLocale = useMemo(() => {
    const locale = componentLocaleContext || defaultLocale
    return {
      ...(locale instanceof Function ? locale() : locale),
    } as L[T]
  }, [defaultLocale, componentLocaleContext])

  return [componentLocale]
}

export const useLocales = <T extends Locale>(editor: Editable, lang: string): T => {
  const locales = useMemo(() => {
    return getStore(editor).getState().locales[lang]
  }, [editor, lang])
  return locales as T
}

export const useLocaleFormat = <
  L extends Locale,
  T extends LocaleComponentName<L> = LocaleComponentName<L>,
>(
  componentName: T,
) => {
  const [locale] = useLocale<L>(componentName)
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
