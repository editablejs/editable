import { Descendant, Editable, isHotkey, Locale, Range, formatHotkey } from '@editablejs/editor'
import writeClipboard from 'copy-to-clipboard'
import { Icon } from '@editablejs/plugin-ui'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import { ContextMenuEditor } from '@editablejs/plugin-context-menu'
import locales, { GlobalLocale } from './locale'

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

export interface GlobalEditor extends Editable {
  copy: () => void
}

export interface WriteClipboardOptions {
  html?: string
  text?: string
  fragment?: Descendant[] | string
}

const APPLICATION_FRAGMENT_TYPE = 'application/x-editablejs-fragment'

const DATA_EDITABLEJS_FRAGMENT = 'data-editablejs-fragment'

export const GlobalEditor = {
  isGlobalEditor: (editor: Editable): editor is GlobalEditor => {
    return !!(editor as GlobalEditor).copy
  },

  isEnabled: (editor: Editable, type: GlobalType) => {
    const { enabled, disabled } = GLOBAL_OPTIONS.get(editor) ?? {}
    if (enabled && ~~enabled.indexOf(type)) return false
    if (disabled && ~disabled.indexOf(type)) return false
    return true
  },

  getOptions: (editor: Editable): GlobalOptions => {
    return GLOBAL_OPTIONS.get(editor) ?? {}
  },

  copy: (editor: Editable) => {
    if (GlobalEditor.isGlobalEditor(editor)) {
      editor.copy()
    }
  },

  encodeFragment: (fragment: Descendant[]) => {
    const string = JSON.stringify(fragment)
    return window.btoa(encodeURIComponent(string))
  },

  writeClipboard: (options: WriteClipboardOptions) => {
    const { html = '', text = '', fragment = [] } = options
    writeClipboard(html, {
      format: 'text/html',
      onCopy: e => {
        const data = e as DataTransfer
        const encoded =
          typeof fragment === 'string' ? fragment : GlobalEditor.encodeFragment(fragment)
        data.setData('text/plain', text)
        data.setData(APPLICATION_FRAGMENT_TYPE, encoded)
      },
    })
  },
}

export const withGlobal = <T extends Editable>(editor: T, options: GlobalOptions = {}) => {
  const newEditor = editor as T & GlobalEditor

  GLOBAL_OPTIONS.set(newEditor, options)

  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)

  const { onKeydown } = newEditor

  for (const key in locales) {
    Locale.setLocale(newEditor, key, locales[key])
  }

  const vaildHotkey = (type: GlobalType, e: KeyboardEvent) => {
    const hotkey = hotkeys[type]
    if (
      (typeof hotkey === 'string' && isHotkey(hotkey, e)) ||
      (typeof hotkey === 'function' && hotkey(e))
    ) {
      return true
    }
    return false
  }

  const getHotkeyText = (type: GlobalType) => {
    const hotkey = hotkeys[type]
    return typeof hotkey === 'string' ? formatHotkey(hotkey) : undefined
  }

  newEditor.onKeydown = (e: KeyboardEvent) => {
    if (vaildHotkey(CUT_KEY, e)) {
    } else if (vaildHotkey(COPY_KEY, e)) {
      newEditor.copy()
    } else if (vaildHotkey(PASTE_KEY, e)) {
    } else if (vaildHotkey(PASTE_TEXT_KEY, e)) {
    } else {
      onKeydown(e)
    }
  }

  ContextMenuEditor.with(newEditor, e => {
    const { onContextMenu } = e
    e.onContextMenu = items => {
      const { selection } = newEditor

      const locale = Locale.getLocale<GlobalLocale>(newEditor).global

      const isDisabled = !selection || Range.isCollapsed(selection)

      if (GlobalEditor.isEnabled(newEditor, CUT_KEY)) {
        items.push({
          key: CUT_KEY,
          icon: <Icon name={CUT_KEY} />,
          title: locale.cut,
          rightText: getHotkeyText(CUT_KEY),
          disabled: isDisabled,
          sort: 0,
        })
      }

      if (GlobalEditor.isEnabled(newEditor, COPY_KEY)) {
        items.push({
          key: COPY_KEY,
          icon: <Icon name={COPY_KEY} />,
          title: locale.copy,
          rightText: getHotkeyText(COPY_KEY),
          disabled: isDisabled,
          sort: 0,
          onSelect: () => {
            newEditor.copy()
          },
        })
      }
      if (GlobalEditor.isEnabled(newEditor, PASTE_KEY)) {
        items.push({
          key: PASTE_KEY,
          icon: <Icon name={PASTE_KEY} />,
          title: locale.paste,
          rightText: getHotkeyText(PASTE_KEY),
          disabled: !selection,
          sort: 0,
        })
      }
      if (GlobalEditor.isEnabled(newEditor, PASTE_TEXT_KEY)) {
        items.push({
          key: PASTE_TEXT_KEY,
          icon: <Icon name="pasteText" />,
          title: locale.pasteText,
          rightText: getHotkeyText(PASTE_TEXT_KEY),
          disabled: !selection,
          sort: 0,
        })
      }
      return onContextMenu(items)
    }
  })

  newEditor.copy = () => {
    if (!SerializeEditor.isSerializeEditor(newEditor)) return
    const fragment = editor.getFragment()
    const encoded = GlobalEditor.encodeFragment(fragment)

    const text = fragment.map(newEditor.serializeText).join('\n')

    let html = fragment.map(child => newEditor.serializeHtml({ node: child })).join('')
    html = `<div ${DATA_EDITABLEJS_FRAGMENT}="${encoded}">${html}</div>`
    html = `<html><head><meta name="source" content="editablejs" /></head><body>${html}</body></html>`
    console.log(html)
    GlobalEditor.writeClipboard({ html, text, fragment })
  }

  return newEditor
}
