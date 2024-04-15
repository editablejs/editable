import { merge } from "@/utils"
import { Editor } from "./editor"

export interface Locale {
  locale: string
}

interface LocaleOptions {
  lang: string
  localeMap: Record<string, Locale>
}

const EDITOR_TO_LOCALE: WeakMap<Editor, LocaleOptions> = new WeakMap()

const getOrCreateLocale = (editor: Editor) => {
  let locale = EDITOR_TO_LOCALE.get(editor)
  if (!locale) {
    locale = {
      lang: 'en-US',
      localeMap: {},
    }
    EDITOR_TO_LOCALE.set(editor, locale)
  }
  return locale
}

export interface LocaleInterface {
  setLocale: <T extends Locale>(editor: Editor, ...localeMap: Record<string, T>[]) => void
  getLocale: <T extends Locale>(editor: Editor) => T
  getLocaleMap: (editor: Editor) => Record<string, Locale>
  getLang: (editor: Editor) => string
  setLang: (editor: Editor, lang: string) => void
}

export const Locale: LocaleInterface = {
  setLocale(editor, ...localeMap) {
    const locale = getOrCreateLocale(editor)
    const { localeMap: prevLocaleMap } = locale
    const newLocaleMap = Object.assign({}, prevLocaleMap)
    for (const locale of localeMap) {
      for (const key in locale) {
        newLocaleMap[key] = merge(newLocaleMap[key], locale[key])
      }
    }
    locale.localeMap = newLocaleMap
    editor.onLocaleChange()
  },

  getLocale(editor) {
    const locale = getOrCreateLocale(editor)
    return locale.localeMap[locale.lang] as any
  },

  getLocaleMap(editor) {
    const { localeMap } = getOrCreateLocale(editor)
    return localeMap
  },

  getLang(editor) {
    const { lang } = getOrCreateLocale(editor)
    return lang
  },

  setLang(editor, lang) {
    const locale = getOrCreateLocale(editor)
    locale.lang = lang
    editor.onLocaleChange()
  },
}
