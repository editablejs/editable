import { Editable, Locale, Range } from '@editablejs/editor'
import locales, { GlobalLocale } from './locale'
import { Icon } from '../ui'
import { formatHotkey } from '../utils'

export const CUT_KEY = 'cut'
export const COPY_KEY = 'copy'
export const PASTE_KEY = 'paste'
export const PASTE_TEXT_KEY = 'paste-text'

export type GlobalType = typeof CUT_KEY | typeof COPY_KEY | typeof PASTE_KEY | typeof PASTE_TEXT_KEY

type Hotkey = string | ((e: KeyboardEvent) => boolean)

type Hotkeys = Record<GlobalType, Hotkey>

const defaultHotkeys: Hotkeys = {
  [CUT_KEY]: 'mod+x',
  [COPY_KEY]: 'mod+c',
  [PASTE_KEY]: 'mod+v',
  [PASTE_TEXT_KEY]: 'mod+shift+v',
}

export interface GlobalOptions {
  enabled?: GlobalType[]
  disabled?: GlobalType[]
  hotkeys?: Hotkeys
}

export const GLOBAL_OPTIONS = new WeakMap<Editable, GlobalOptions>()

export interface GlobalEditor extends Editable {}

export const GlobalEditor = {
  isEnabled: (editor: Editable, type: GlobalType) => {
    const { enabled, disabled } = GLOBAL_OPTIONS.get(editor) ?? {}
    if (enabled && ~~enabled.indexOf(type)) return false
    if (disabled && ~disabled.indexOf(type)) return false
    return true
  },

  getOptions: (editor: Editable): GlobalOptions => {
    return GLOBAL_OPTIONS.get(editor) ?? {}
  },
}

export const withGlobal = <T extends Editable>(editor: T, options: GlobalOptions = {}) => {
  const newEditor = editor as T & GlobalEditor

  GLOBAL_OPTIONS.set(newEditor, options)

  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)

  const { onContextMenu } = newEditor

  for (const key in locales) {
    Locale.setLocale(newEditor, key, locales[key])
  }

  newEditor.onContextMenu = (e: MouseEvent, items) => {
    const { selection } = newEditor

    const locale = Locale.getLocale<GlobalLocale>(newEditor).global

    const isDisabled = !selection || Range.isCollapsed(selection)

    if (GlobalEditor.isEnabled(newEditor, CUT_KEY)) {
      const hotkey = hotkeys[CUT_KEY]
      items.push({
        key: CUT_KEY,
        icon: <Icon name={CUT_KEY} />,
        title: locale.cut,
        rightText: typeof hotkey === 'string' ? formatHotkey(hotkey) : undefined,
        disabled: isDisabled,
        sort: 0,
      })
    }

    if (GlobalEditor.isEnabled(newEditor, COPY_KEY)) {
      const hotkey = hotkeys[COPY_KEY]
      items.push({
        key: COPY_KEY,
        icon: <Icon name={COPY_KEY} />,
        title: locale.copy,
        rightText: typeof hotkey === 'string' ? formatHotkey(hotkey) : undefined,
        disabled: isDisabled,
        sort: 0,
      })
    }
    if (GlobalEditor.isEnabled(newEditor, PASTE_KEY)) {
      const hotkey = hotkeys[PASTE_KEY]
      items.push({
        key: PASTE_KEY,
        icon: <Icon name={PASTE_KEY} />,
        title: locale.paste,
        rightText: typeof hotkey === 'string' ? formatHotkey(hotkey) : undefined,
        disabled: !selection,
        sort: 0,
      })
    }
    if (GlobalEditor.isEnabled(newEditor, PASTE_TEXT_KEY)) {
      const hotkey = hotkeys[PASTE_TEXT_KEY]
      items.push({
        key: PASTE_TEXT_KEY,
        icon: <Icon name="pasteText" />,
        title: locale.pasteText,
        rightText: typeof hotkey === 'string' ? formatHotkey(hotkey) : undefined,
        disabled: !selection,
        sort: 0,
      })
    }
    return onContextMenu(e, items)
  }

  return newEditor
}
