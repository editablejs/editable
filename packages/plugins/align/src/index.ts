import { Editable, Hotkey, Editor, Transforms, Element, List } from '@editablejs/editor'
import {} from './constants'
import { AlignEditor } from './editor'
import { Align, AlignKeys, AlignValue } from './interfaces/align'
import { AlignHotkey, AlignOptions, setOptions } from './options'

const defaultHotkeys: AlignHotkey = {
  left: 'mod+shift+l',
  center: 'mod+shift+c',
  right: 'mod+shift+r',
  justify: 'mod+shift+j',
}

export const withAlign = <T extends Editable>(editor: T, options: AlignOptions = {}) => {
  const newEditor = editor as T & AlignEditor

  setOptions(newEditor, options)

  newEditor.toggleAlign = (value = AlignValue.Left) => {
    editor.normalizeSelection(selection => {
      if (!selection) return
      if (editor.selection !== selection) editor.selection = selection
      if (!AlignEditor.isAlignEditor(editor)) return

      const lowestBlocks = Editor.nodes<Element>(editor, {
        mode: 'lowest',
        match: n => Editor.isBlock(editor, n),
      })

      for (const [element, path] of lowestBlocks) {
        const entry = Editor.above<List>(editor, {
          at: path,
          match: n => editor.isList(n),
        })
        const el = entry ? entry[0] : element
        if (Align.isAlign(el) && el.textAlign === value) continue
        const at = entry ? entry[1] : path
        Transforms.setNodes<Align>(
          editor,
          {
            textAlign: value,
          },
          {
            at,
          },
        )
      }
    })
  }

  const { renderElementAttributes } = newEditor

  newEditor.renderElementAttributes = ({ attributes, element }) => {
    const style: React.CSSProperties = attributes.style ?? {}
    if (Align.isAlign(element)) {
      const { textAlign } = element
      const isList = editor.isList(element)
      const attr = isList && textAlign !== AlignValue.Justify ? 'justifyContent' : 'textAlign'
      if (textAlign === AlignValue.Left) {
        delete style[attr]
      } else {
        style[attr] = textAlign
      }
      attributes = Object.assign({}, attributes, { style })
    }
    return renderElementAttributes({
      attributes,
      element,
    })
  }

  const { onKeydown } = newEditor

  const hotkeys: AlignHotkey = Object.assign({}, defaultHotkeys, options.hotkeys)
  newEditor.onKeydown = (e: KeyboardEvent) => {
    for (let key in hotkeys) {
      const value = key as AlignKeys
      const hotkey = hotkeys[value]
      const toggle = () => {
        e.preventDefault()
        newEditor.toggleAlign(value)
      }
      if (
        (typeof hotkey === 'string' && Hotkey.is(hotkey, e)) ||
        (typeof hotkey === 'function' && hotkey(e))
      ) {
        toggle()
        return
      }
    }
    onKeydown(e)
  }

  return newEditor
}

const { wrapList, unwrapList, splitList } = List

List.wrapList = (editor, entry, options = {}) => {
  const { props } = options

  wrapList(editor, entry, {
    ...options,
    props(key, node, path) {
      const p = props ? props(key, node, path) : {}
      if (Align.isAlign(node)) {
        const { textAlign } = node
        Transforms.setNodes<Align>(
          editor,
          { textAlign: AlignValue.Left },
          {
            at: path,
          },
        )
        return {
          ...p,
          textAlign,
        }
      }
      return p
    },
  })
}

List.unwrapList = (editor, options = {}) => {
  const { props } = options

  unwrapList(editor, {
    ...options,
    props(list, path) {
      const p = props ? props(list, path) : {}
      if (Align.isAlign(list)) {
        const { textAlign } = list
        return {
          ...p,
          textAlign,
        }
      }
      return p
    },
  })
}

List.splitList = (editor, options = {}) => {
  const { props } = options

  splitList(editor, {
    ...options,
    props(list, path) {
      const p = props ? props(list, path) : {}
      if (Align.isAlign(list)) {
        const { textAlign } = list
        return {
          ...p,
          textAlign,
        }
      }
      return p
    },
  })
}

export type { AlignOptions, AlignHotkey }

export * from './interfaces/align'

export * from './editor'
