import { Editable, Hotkey, Editor, Transforms, Element, List } from '@editablejs/editor'
import { LEADING_ATTR_KEY } from './constants'
import { LeadingEditor } from './editor'
import { Leading } from './interfaces/leading'
import { LeadingHotkey, LeadingOptions, setOptions } from './options'

const defaultHotkeys: LeadingHotkey = {}

export const withLeading = <T extends Editable>(editor: T, options: LeadingOptions = {}) => {
  const newEditor = editor as T & LeadingEditor

  setOptions(newEditor, options)

  newEditor.toggleLeading = value => {
    editor.normalizeSelection(selection => {
      if (!selection) return
      if (editor.selection !== selection) editor.selection = selection
      if (!LeadingEditor.isLeadingEditor(editor)) return

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
        if (Leading.isLeading(el) && el[LEADING_ATTR_KEY] === value) continue
        const at = entry ? entry[1] : path
        Transforms.setNodes<Leading>(
          editor,
          {
            [LEADING_ATTR_KEY]: value,
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
    const style: typeof attributes.style = attributes.style ?? {}
    if (Leading.isLeading(element)) {
      const leading = element[LEADING_ATTR_KEY]
      if (!leading) {
        delete style[LEADING_ATTR_KEY]
      } else {
        style[LEADING_ATTR_KEY] = leading
      }
      attributes = Object.assign({}, attributes, { style })
    }
    return renderElementAttributes({
      attributes,
      element,
    })
  }

  const { onKeydown } = newEditor

  const hotkeys: LeadingHotkey = Object.assign({}, defaultHotkeys, options.hotkeys)
  newEditor.onKeydown = (e: KeyboardEvent) => {
    const value = Hotkey.match(hotkeys, e)
    if (value) {
      e.preventDefault()
      newEditor.toggleLeading(value)
      return
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
      if (Leading.isLeading(node)) {
        const lineHeight = node[LEADING_ATTR_KEY]
        Transforms.setNodes<Leading>(
          editor,
          { [LEADING_ATTR_KEY]: undefined },
          {
            at: path,
          },
        )
        return {
          ...p,
          lineHeight,
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
      if (Leading.isLeading(list)) {
        const lineHeight = list[LEADING_ATTR_KEY]
        return {
          ...p,
          lineHeight,
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
      if (Leading.isLeading(list)) {
        const lineHeight = list[LEADING_ATTR_KEY]
        return {
          ...p,
          lineHeight,
        }
      }
      return p
    },
  })
}

export type { LeadingOptions, LeadingHotkey }

export * from './interfaces/leading'

export * from './editor'
