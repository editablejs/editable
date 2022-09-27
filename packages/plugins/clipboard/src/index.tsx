import {
  Descendant,
  Editable,
  isHotkey,
  Locale,
  Range,
  formatHotkey,
  Editor,
  Transforms,
  Node,
} from '@editablejs/editor'
import writeClipboard from 'copy-to-clipboard'
import { Icon } from '@editablejs/plugin-ui'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import { ContextMenuEditor } from '@editablejs/plugin-context-menu'
import locales, { ClipboardLocale } from './locale'

export const CUT_KEY = 'cut'
export const COPY_KEY = 'copy'
export const PASTE_KEY = 'paste'
export const PASTE_TEXT_KEY = 'paste-text'

export type ClipboardType =
  | typeof CUT_KEY
  | typeof COPY_KEY
  | typeof PASTE_KEY
  | typeof PASTE_TEXT_KEY

type Hotkey = string | ((e: KeyboardEvent) => boolean)

type Hotkeys = Record<ClipboardType, Hotkey>

const defaultHotkeys: Hotkeys = {
  [CUT_KEY]: 'mod+x',
  [COPY_KEY]: 'mod+c',
  [PASTE_KEY]: 'mod+v',
  [PASTE_TEXT_KEY]: 'mod+shift+v',
}

export interface ClipboardOptions {
  enabled?: ClipboardType[]
  disabled?: ClipboardType[]
  hotkeys?: Hotkeys
}

export const CLIPBOARD_OPTIONS = new WeakMap<Editable, ClipboardOptions>()

export interface ClipboardEditor extends Editable {
  cut: () => void
  copy: () => void
  paste: (onlyText?: boolean) => void
  pasteText: (text: string) => void
  pasteHtml: (html: string) => void
}

export interface SetClipboardOptions {
  html?: string
  text?: string
  fragment?: Descendant[] | string
}

const APPLICATION_FRAGMENT_TYPE = 'application/x-editablejs-fragment'

const DATA_EDITABLEJS_FRAGMENT = 'data-editablejs-fragment'

export const ClipboardEditor = {
  isClipboardEditor: (editor: Editable): editor is ClipboardEditor => {
    return !!(editor as ClipboardEditor).copy
  },

  isEnabled: (editor: Editable, type: ClipboardType) => {
    const { enabled, disabled } = CLIPBOARD_OPTIONS.get(editor) ?? {}
    if (enabled && ~~enabled.indexOf(type)) return false
    if (disabled && ~disabled.indexOf(type)) return false
    return true
  },

  getOptions: (editor: Editable): ClipboardOptions => {
    return CLIPBOARD_OPTIONS.get(editor) ?? {}
  },

  copy: (editor: Editable) => {
    if (ClipboardEditor.isClipboardEditor(editor)) {
      editor.copy()
    }
  },

  encode: (fragment: Descendant[]) => {
    const string = JSON.stringify(fragment)
    return window.btoa(encodeURIComponent(string))
  },

  decode: (string: string) => {
    const fragment: Descendant[] = JSON.parse(decodeURIComponent(window.atob(string)))
    return fragment
  },

  getFragmentString: (html: string) => {
    const reg = new RegExp(`${DATA_EDITABLEJS_FRAGMENT}="(.+?)"`)
    return html.match(reg)?.[1] ?? ''
  },

  getData: (data: DataTransfer) => {
    const text = data.getData('text/plain')
    const html = data.getData('text/html')
    let fragment = data.getData(APPLICATION_FRAGMENT_TYPE)
    if (!fragment) fragment = ClipboardEditor.getFragmentString(html)

    return {
      text,
      html,
      fragment: fragment ? ClipboardEditor.decode(fragment) : [],
    }
  },

  getClipboardData: async () => {
    let text = ''
    let html = ''
    let fragment = ''
    try {
      const data = await navigator.clipboard.read()
      if (data.length === 0) throw new Error('No data')
      const item = data[0]
      try {
        text = await (await item.getType('text/plain')).text()
      } catch {}
      try {
        html = await (await item.getType('text/html')).text()
      } catch {}
      try {
        fragment = await (await item.getType(APPLICATION_FRAGMENT_TYPE)).text()
      } catch (error) {
        fragment = ClipboardEditor.getFragmentString(html)
      }
    } catch (error) {
      console.error(error)
    }
    return {
      text,
      html,
      fragment: fragment ? ClipboardEditor.decode(fragment) : [],
    }
  },

  setData: (options: SetClipboardOptions) => {
    const { html = '', text = '', fragment = [] } = options
    writeClipboard(html, {
      format: 'text/html',
      onCopy: e => {
        const data = e as DataTransfer
        const encoded = typeof fragment === 'string' ? fragment : ClipboardEditor.encode(fragment)
        data.setData('text/plain', text)
        data.setData(APPLICATION_FRAGMENT_TYPE, encoded)
      },
    })
  },
}

export const withClipboard = <T extends Editable>(editor: T, options: ClipboardOptions = {}) => {
  const newEditor = editor as T & ClipboardEditor

  CLIPBOARD_OPTIONS.set(newEditor, options)

  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)

  const { onKeydown } = newEditor

  for (const key in locales) {
    Locale.setLocale(newEditor, key, locales[key])
  }

  const vaildHotkey = (type: ClipboardType, e: KeyboardEvent) => {
    const hotkey = hotkeys[type]
    if (
      (typeof hotkey === 'string' && isHotkey(hotkey, e)) ||
      (typeof hotkey === 'function' && hotkey(e))
    ) {
      return true
    }
    return false
  }

  const getHotkeyText = (type: ClipboardType) => {
    const hotkey = hotkeys[type]
    return typeof hotkey === 'string' ? formatHotkey(hotkey) : undefined
  }

  let isPasteText = false

  newEditor.onKeydown = (e: KeyboardEvent) => {
    if (vaildHotkey(CUT_KEY, e)) {
      newEditor.cut()
    } else if (vaildHotkey(COPY_KEY, e)) {
      newEditor.copy()
    } else if (vaildHotkey(PASTE_KEY, e)) {
      isPasteText = false
    } else if (vaildHotkey(PASTE_TEXT_KEY, e)) {
      isPasteText = true
    } else {
      onKeydown(e)
    }
  }

  newEditor.onPaste = (e: ClipboardEvent) => {
    const { clipboardData } = e
    if (!clipboardData) return
    e.preventDefault()
    const { text, fragment, html } = ClipboardEditor.getData(clipboardData)
    if (!isPasteText && fragment.length > 0) {
      newEditor.insertFragment(fragment)
    } else if (!isPasteText && html) {
      newEditor.pasteHtml(html)
    } else {
      newEditor.pasteText(text)
    }
  }

  ContextMenuEditor.with(newEditor, e => {
    const { onContextMenu } = e
    e.onContextMenu = items => {
      const { selection } = newEditor

      const locale = Locale.getLocale<ClipboardLocale>(newEditor).clipboard

      const isDisabled = !selection || Range.isCollapsed(selection)

      if (ClipboardEditor.isEnabled(newEditor, CUT_KEY)) {
        items.push({
          key: CUT_KEY,
          icon: <Icon name={CUT_KEY} />,
          title: locale.cut,
          rightText: getHotkeyText(CUT_KEY),
          disabled: isDisabled,
          index: 0,
          onSelect: () => {
            newEditor.cut()
          },
        })
      }

      if (ClipboardEditor.isEnabled(newEditor, COPY_KEY)) {
        items.push({
          key: COPY_KEY,
          icon: <Icon name={COPY_KEY} />,
          title: locale.copy,
          rightText: getHotkeyText(COPY_KEY),
          disabled: isDisabled,
          index: 0,
          onSelect: () => {
            newEditor.copy()
          },
        })
      }
      if (ClipboardEditor.isEnabled(newEditor, PASTE_KEY)) {
        items.push({
          key: PASTE_KEY,
          icon: <Icon name={PASTE_KEY} />,
          title: locale.paste,
          rightText: getHotkeyText(PASTE_KEY),
          disabled: !selection,
          index: 0,
          onSelect: () => {
            newEditor.paste()
          },
        })
      }
      if (ClipboardEditor.isEnabled(newEditor, PASTE_TEXT_KEY)) {
        items.push({
          key: PASTE_TEXT_KEY,
          icon: <Icon name="pasteText" />,
          title: locale.pasteText,
          rightText: getHotkeyText(PASTE_TEXT_KEY),
          disabled: !selection,
          index: 0,
          onSelect: () => {
            newEditor.paste(true)
          },
        })
      }
      return onContextMenu(items)
    }
  })

  newEditor.cut = () => {
    newEditor.copy()
    const { selection } = newEditor
    if (selection) {
      if (Range.isExpanded(selection)) {
        Editor.deleteFragment(newEditor)
      } else {
        const node = Node.parent(newEditor, selection.anchor.path)
        if (Editor.isVoid(newEditor, node)) {
          Transforms.delete(newEditor)
        }
      }
    }
  }

  newEditor.copy = () => {
    if (!SerializeEditor.isSerializeEditor(newEditor)) return
    const fragment = editor.getFragment()
    const encoded = ClipboardEditor.encode(fragment)

    const text = fragment.map(newEditor.serializeText).join('\n')

    let html = fragment.map(child => newEditor.serializeHtml({ node: child })).join('')
    html = `<div ${DATA_EDITABLEJS_FRAGMENT}="${encoded}">${html}</div>`
    html = `<html><head><meta name="source" content="${DATA_EDITABLEJS_FRAGMENT}" /></head><body>${html}</body></html>`
    ClipboardEditor.setData({ html, text, fragment: encoded })
  }

  newEditor.pasteHtml = (html: string) => {
    const document = new DOMParser().parseFromString(html, 'text/html')
    const fragment = SerializeEditor.deserializeHtml(newEditor, {
      node: document.body,
    })
    console.log(fragment)
    newEditor.insertFragment(fragment)
  }

  newEditor.pasteText = (text: string) => {
    const lines = text.split(/\r\n|\r|\n/)
    let split = false

    for (const line of lines) {
      if (split) {
        Transforms.splitNodes(newEditor, { always: true })
      }
      newEditor.normalizeSelection(selection => {
        if (selection !== newEditor.selection) newEditor.selection = selection
        newEditor.insertText(line)
      })
      split = true
    }
  }

  newEditor.paste = (onlyText = false) => {
    ClipboardEditor.getClipboardData().then(({ html, fragment, text }) => {
      newEditor.normalizeSelection(selection => {
        if (selection !== newEditor.selection) newEditor.selection = selection
        if (!onlyText && fragment.length > 0) {
          newEditor.insertFragment(fragment)
        } else if (!onlyText && html) {
          newEditor.pasteHtml(html)
        } else if (text) {
          newEditor.pasteText(text)
        }
      })
    })
  }

  return newEditor
}
