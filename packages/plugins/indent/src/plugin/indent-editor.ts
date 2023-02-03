import { Editable } from '@editablejs/editor'
import { Editor, Path, Transforms, Node, Element, Range } from '@editablejs/models'
import { DEFAULT_SIZE, INDENT_KEY } from '../constants'
import { Indent } from '../interfaces/indent'
import { INDENT_OPTIONS, IndentOptions } from '../options'
import { IndentMode } from '../types'
import { setTextIndent, setLineIndent } from '../utils'

export interface IndentEditor extends Editor {
  toggleIndent: (mode?: IndentMode) => void

  toggleOutdent: () => void

  onIndentMatch:
    | (<T extends Node>(node: Node, path: Path) => node is T)
    | ((node: Node, path: Path) => boolean)
}

export const IndentEditor = {
  isIndentEditor: (editor: Editor): editor is IndentEditor => {
    return !!(editor as IndentEditor).toggleIndent
  },

  isIndent: (editor: Editor, node: Node): node is Indent => {
    return Indent.isIndent(node)
  },

  isIndentBlock: (editor: Editor, node: Node): node is Indent => {
    const indent = node as Indent
    return !!(indent.textIndent || indent.lineIndent)
  },

  queryActive: (editor: Editor) => {
    const elements = Editor.elements(editor)
    for (const type in elements) {
      for (const [element] of elements[type]) {
        const { textIndent, lineIndent } = element as Indent
        if (textIndent || lineIndent) {
          const text = textIndent ?? 0
          const line = lineIndent ?? 0
          const options = INDENT_OPTIONS.get(editor) ?? {}
          const size = options.size ?? DEFAULT_SIZE
          const all = text + line
          const level = all < 1 ? 0 : (text + line) / size
          return {
            text,
            line,
            level,
          }
        }
      }
    }
    return null
  },

  toggle: (editor: Editor, mode?: IndentMode) => {
    if (IndentEditor.isIndentEditor(editor)) editor.toggleIndent(mode)
  },

  toggleOut: (editor: Editor) => {
    if (IndentEditor.isIndentEditor(editor)) editor.toggleOutdent()
  },

  getOptions: (editor: Editor): IndentOptions => {
    return INDENT_OPTIONS.get(editor) ?? {}
  },

  getSize: (editor: Editor): number => {
    const options = INDENT_OPTIONS.get(editor) ?? {}
    return options.size ?? DEFAULT_SIZE
  },

  getLevel: (editor: Editor, element: Indent) => {
    const { textIndent, lineIndent } = element
    const count = (textIndent ?? 0) + (lineIndent ?? 0)
    const size = IndentEditor.getSize(editor)
    return count > 0 ? count / size : 0
  },

  addTextIndent: (editor: Editor, path: Path, sub = false) => {
    const element = Node.get(editor, path)
    if (Element.isElement(element)) {
      const size = IndentEditor.getSize(editor)
      setTextIndent(editor, [element, path], sub ? -size : size)
    }
  },

  addLineIndent: (editor: Editor, path: Path, sub = false) => {
    const element = Node.get(editor, path)
    if (Element.isElement(element)) {
      const size = IndentEditor.getSize(editor)
      setLineIndent(editor, [element, path], sub ? -size : size)
    }
  },

  removeIndent: (editor: Editor, path: Path) => {
    const element = Node.get(editor, path)
    if (Element.isElement(element)) {
      setLineIndent(editor, [element, path], -99999)
    }
  },

  canSetIndent: (editor: Editor, mode: IndentMode = 'auto') => {
    const { selection } = editor
    if (!selection || !IndentEditor.isIndentEditor(editor)) return false
    // 是否选中一行
    const selectLine = Editable.getSelectLine(editor)
    // 是否选中在一行的开始或结尾位置
    const selectLineEdge = Editable.isSelectLineEdge(editor)

    const isCollapsed = Range.isCollapsed(selection)
    if (isCollapsed && (!selectLine || mode === 'line')) {
      const entry = Editor.above(editor, {
        match: editor.onIndentMatch,
        at: selection.anchor,
      })
      if (!entry) return false
      const [_, path] = entry
      // 在节点的开始位置，设置text indent
      if (Editor.isStart(editor, selection.focus, path) || selectLineEdge) return true
    } else {
      return selectLine
    }
  },

  insertIndent: (editor: Editor) => {
    const { selection } = editor
    if (!selection) return
    const size = IndentEditor.getSize(editor)
    Transforms.insertNodes(
      editor,
      {
        type: INDENT_KEY,
        textIndent: Math.abs(size),
        children: [],
      } as Indent,
      {
        at: selection,
      },
    )
    const { focus } = selection
    const path = focus.path.concat()
    const lastIndex = path.length - 1
    path[lastIndex] = path[lastIndex] + 2
    const point = {
      offset: 0,
      path: path,
    }
    Transforms.select(editor, {
      anchor: point,
      focus: point,
    })
  },
}
