import { Editor, Transforms, List } from '@editablejs/models'
import { Indent } from './interfaces/indent'
import { IndentEditor } from './plugin/indent-editor'

const { wrapList, unwrapList, splitList } = List

List.wrapList = (editor, entry, options = {}) => {
  const { props } = options

  wrapList(editor, entry, {
    ...options,
    props(key, node, path) {
      const p = props ? props(key, node, path) : {}
      if (IndentEditor.isIndentBlock(editor, node)) {
        const { lineIndent = 0, textIndent = 0 } = node
        Transforms.setNodes<Indent>(
          editor,
          { lineIndent: 0, textIndent: 0 },
          {
            at: path,
          },
        )
        return {
          ...p,
          lineIndent: lineIndent + textIndent,
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
      if (IndentEditor.isIndentBlock(editor, list)) {
        const { lineIndent = 0 } = list as Indent
        return {
          ...p,
          lineIndent,
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
      if (IndentEditor.isIndentBlock(editor, list)) {
        const size = IndentEditor.getSize(editor)
        const { lineIndent = 0 } = list as Indent
        const indent = Math.max(lineIndent - size, 0)
        return {
          ...p,
          lineIndent: indent,
        }
      }
      return p
    },
  })
}

List.getLevel = (editor, options) => {
  const { path, key, type } = options
  const [element] = Editor.nodes<Indent>(editor, {
    at: path,
    match: n => {
      if (!Editor.isBlock(editor, n)) return false
      const indent = n as Indent
      return indent.lineIndent !== undefined || indent.textIndent !== undefined
    },
    mode: 'highest',
  })
  const prev = Editor.previous<List & Indent>(editor, {
    at: path,
    match: n => editor.isList(n) && n.type === type && n.key === key,
  })
  const prevIndentLevel = prev ? IndentEditor.getLevel(editor, prev[0]) : 0
  const prefixIndentLevel = prev ? prevIndentLevel - prev[0].level : 0
  const elementIndentLevel = element ? IndentEditor.getLevel(editor, element[0]) : 0
  return elementIndentLevel - prefixIndentLevel
}

List.setIndent = (editor, list) => {
  const indent = list as Indent
  indent.lineIndent = list.level * IndentEditor.getSize(editor)
  return list
}

export type { IndentOptions, IndentHotkey } from './options'

export * from './interfaces/indent'

export * from './plugin/indent-editor'

export * from './plugin/with-indent'

export * from './types'
