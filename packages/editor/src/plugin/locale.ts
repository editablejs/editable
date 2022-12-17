import merge from 'lodash.merge'
import create, { StoreApi, UseBoundStore } from 'zustand'
import { Editable } from '../plugin/editable'
export interface Locale {
  locale: string
}

export interface LocaleState {
  lang: string
  locales: Record<string, Locale>
}

const EDITOR_TO_LOCALE_STORE: WeakMap<
  Editable,
  UseBoundStore<StoreApi<LocaleState>>
> = new WeakMap()

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

export const Locale = {
  getStore,

  setLocale: <T extends Locale>(editor: Editable, lang: string, locale: T) => {
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

  getLang: (editor: Editable) => {
    const state = getStore(editor).getState()
    return state.lang
  },

  setLang: (editor: Editable, lang: string) => {
    const store = getStore(editor)
    store.setState(state => {
      return {
        lang,
        locales: state.locales,
      }
    })
  },

  getLocale: <T extends Locale>(editor: Editable): T => {
    const lang = Locale.getLang(editor)
    const locales = Locale.getLocales(editor)
    return (locales[lang] ?? locales['en-US']) as any
  },

  getLocales: (editor: Editable): Record<string, Locale> => {
    const state = getStore(editor).getState()
    return state.locales
  },
}

export type LocaleComponentName<T extends Locale> = Exclude<keyof T, 'locale'>
