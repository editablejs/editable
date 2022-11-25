import {
  Editable,
  ElementAttributes,
  Hotkey,
  RenderElementAttributes,
  RenderElementProps,
  Editor,
  Transforms,
  Node,
  Element,
  NodeEntry,
  Path,
  Range,
  List,
} from '@editablejs/editor'
import { CSSProperties } from 'react'
import tw from 'twin.macro'
import { INDENT_KEY, OUTDENT_KEY, DEFAULT_SIZE } from './constants'
import { Indent, IndentPluginType, IndentType } from './types'
import { isIndent } from './utils'

type Hotkeys = Record<IndentPluginType, string | ((e: KeyboardEvent) => boolean)>

export interface IndentOptions {
  size?: number
  hotkeys?: Hotkeys
  onRenderSize?: (type: IndentType, size: number) => string | number
}

const defaultHotkeys: Hotkeys = {
  [INDENT_KEY]: 'tab',
  [OUTDENT_KEY]: 'shift+tab',
}

export const INDENT_OPTIONS = new WeakMap<Editable, IndentOptions>()

export interface IndentEditor extends Editable {
  toggleIndent: (mode?: IndentMode) => void

  toggleOutdent: () => void

  onIndentMatch:
    | (<T extends Node>(node: Node, path: Path) => node is T)
    | ((node: Node, path: Path) => boolean)
}

export type IndentMode = 'line' | 'auto'

export const IndentEditor = {
  isIndentEditor: (editor: Editor): editor is IndentEditor => {
    return !!(editor as IndentEditor).toggleIndent
  },

  isIndent: (editor: Editor, node: Node): node is Indent => {
    return isIndent(node)
  },

  isIndentBlock: (editor: Editor, node: Node): node is Indent => {
    const indent = node as Indent
    return !!(indent.textIndent || indent.lineIndent)
  },

  queryActive: (editor: Editable) => {
    const elements = editor.queryActiveElements()
    for (const type in elements) {
      for (const element of elements[type]) {
        const { textIndent, lineIndent } = element[0] as Indent
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

  toggle: (editor: IndentEditor, mode?: IndentMode) => {
    editor.toggleIndent(mode)
  },

  toggleOut: (editor: IndentEditor) => {
    editor.toggleOutdent()
  },

  getOptions: (editor: Editable): IndentOptions => {
    return INDENT_OPTIONS.get(editor) ?? {}
  },

  getSize: (editor: Editable): number => {
    const options = INDENT_OPTIONS.get(editor) ?? {}
    return options.size ?? DEFAULT_SIZE
  },

  getLevel: (editor: Editable, element: Indent) => {
    const { textIndent, lineIndent } = element
    const count = (textIndent ?? 0) + (lineIndent ?? 0)
    const size = IndentEditor.getSize(editor)
    return count > 0 ? count / size : 0
  },

  addTextIndent: (editor: Editable, path: Path, sub = false) => {
    const element = Node.get(editor, path)
    if (Element.isElement(element)) {
      const size = IndentEditor.getSize(editor)
      setTextIndent(editor, [element, path], sub ? -size : size)
    }
  },

  addLineIndent: (editor: Editable, path: Path, sub = false) => {
    const element = Node.get(editor, path)
    if (Element.isElement(element)) {
      const size = IndentEditor.getSize(editor)
      setLineIndent(editor, [element, path], sub ? -size : size)
    }
  },

  removeIndent: (editor: Editable, path: Path) => {
    const element = Node.get(editor, path)
    if (Element.isElement(element)) {
      setLineIndent(editor, [element, path], -99999)
    }
  },

  canSetIndent: (editor: Editable, mode: IndentMode = 'auto') => {
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

  insertIndent: (editor: Editable) => {
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

const setTextIndent = (editor: Editable, blockEntry: NodeEntry<Indent>, size: number) => {
  const [block, path] = blockEntry
  const textIndent = block.textIndent ?? 0
  const lineIndent = block.lineIndent ?? 0
  const indent = Math.max(textIndent + size, 0)
  if (size < 0 && textIndent === 0 && lineIndent > 0) {
    setLineIndent(editor, [block, path], size)
    return
  }
  Transforms.setNodes<Indent>(editor, { textIndent: indent }, { at: path })
}

const setLineIndent = (editor: Editable, blockEntry: NodeEntry<Indent>, size: number) => {
  const [block, path] = blockEntry
  const lineIndent = block.lineIndent ?? 0
  const textIndent = block.textIndent ?? 0
  if (size < 0 && lineIndent === 0 && textIndent > 0) {
    setTextIndent(editor, [block, path], size)
    return
  }
  const indent = Math.max(lineIndent + size, 0)
  Transforms.setNodes(editor, { lineIndent: indent } as Indent, { at: path })
}

const getIndentSize = (editor: Editable, type: IndentType, size: number) => {
  const { onRenderSize } = INDENT_OPTIONS.get(editor) ?? {}
  return onRenderSize ? onRenderSize(type, size) : size
}

const StyledIndent = tw.span`h-full inline-flex`

const renderIndent = (
  editor: Editable,
  { attributes, element, children }: RenderElementProps<Indent>,
  next: (props: RenderElementProps) => JSX.Element,
) => {
  const style: CSSProperties = attributes.style ?? {}

  const { textIndent, type } = element

  if (textIndent && type === INDENT_KEY) {
    children = (
      <StyledIndent style={{ width: getIndentSize(editor, 'text', textIndent) }}>
        {children}
      </StyledIndent>
    )
  }
  return next({ attributes: Object.assign({}, attributes, { style }), children, element })
}

export const renderIndentAttributes = (
  editor: Editable,
  { attributes, element }: RenderElementAttributes<Indent>,
  next: (props: RenderElementAttributes) => ElementAttributes,
) => {
  const { textIndent, lineIndent, type } = element
  const style: CSSProperties = attributes.style ?? {}
  if (textIndent && type !== INDENT_KEY) {
    style.textIndent = getIndentSize(editor, 'text', textIndent)
  } else {
    delete style.textIndent
  }
  if (lineIndent) {
    style.paddingLeft = getIndentSize(editor, 'line', lineIndent)
  } else {
    delete style.paddingLeft
  }
  return next({ attributes: Object.assign({}, attributes, { style }), element })
}

const toggleListIndent = (
  editor: Editable,
  entry: NodeEntry<List>,
  size: number,
  mode: IndentMode = 'auto',
) => {
  if (!IndentEditor.isIndentEditor(editor)) return
  if (!IndentEditor.canSetIndent(editor, 'line')) {
    IndentEditor.insertIndent(editor)
    return
  }
  const isSub = size < 0
  let [list, path] = entry
  const { key, type } = list
  const isTop = List.isTop(editor, {
    path,
    key,
    type,
  })
  // 如果是列表的开头，则更新所有后代的缩进
  if (isTop) {
    IndentEditor.addLineIndent(editor, path, isSub)
    let next: NodeEntry<List> | undefined = undefined
    while (true) {
      next = Editor.next(editor, {
        at: path,
        match: n => editor.isList(n) && n.type === type && n.key === key,
      })
      if (!next) break
      path = next[1]
      IndentEditor.addLineIndent(editor, path, isSub)
      if (isSub) {
        const level = List.getLevel(editor, { path, key: key, type, node: next[0] })
        Transforms.setNodes<List>(
          editor,
          { level },
          {
            at: path,
          },
        )
      }
    }
    if (isSub) {
      List.updateStart(editor, {
        path,
        key,
        type,
      })
    }
  }
  // 非开头缩进
  else {
    // 减去缩进
    if (isSub) {
      toggleNormalIndent(editor, size, mode)
    } else {
      toggleNormalIndent(editor, size, 'line')
    }
    const listEntries = Editor.nodes<List>(editor, {
      match: n => editor.isList(n) && n.type === type,
    })
    for (const [node, p] of listEntries) {
      const level = List.getLevel(editor, {
        path: p,
        key: key,
        node,
        type,
      })
      Transforms.setNodes<List>(
        editor,
        { level },
        {
          at: p,
        },
      )
    }
    List.updateStart(editor, {
      path,
      key,
      type,
    })
  }
}

const toggleNormalIndent = (editor: Editable, size: number, mode: IndentMode = 'auto') => {
  const { selection } = editor
  if (!selection || !IndentEditor.isIndentEditor(editor)) return
  // 是否选中一行
  const selectLine = Editable.getSelectLine(editor)
  // 是否选中在一行的开始或结尾位置
  const selectLineEdge = Editable.isSelectLineEdge(editor)

  const isCollapsed = Range.isCollapsed(selection)
  // text indent
  if (isCollapsed && (!selectLine || mode === 'line')) {
    const entry = Editor.above(editor, {
      match: editor.onIndentMatch,
      at: selection.anchor,
    })
    if (!entry) return
    const [_, path] = entry
    // 在节点的开始位置，设置text indent
    if (Editor.isStart(editor, selection.focus, path)) {
      mode === 'line' ? setLineIndent(editor, entry, size) : setTextIndent(editor, entry, size)
      return
    }
    // 在一行的开始位置，设置line indent
    else if (selectLineEdge) {
      if (size > 0) {
        setTextIndent(editor, entry, -size)
      }
      setLineIndent(editor, entry, size)
    }
  }
  // line indent
  else if (selectLine) {
    const blockEntrys = Editor.nodes<Indent>(editor, {
      match: editor.onIndentMatch,
      mode: 'lowest',
    })
    if (!blockEntrys) return
    for (const entry of blockEntrys) {
      setLineIndent(editor, entry, size)
    }
    return
  }

  IndentEditor.insertIndent(editor)
}

const toggleIndent = (editor: IndentEditor, size: number, mode: IndentMode = 'auto') => {
  editor.normalizeSelection(selection => {
    if (!selection) return
    if (editor.selection !== selection) editor.selection = selection
    if (!IndentEditor.isIndentEditor(editor)) return
    const entry = Editor.above<List>(editor, {
      at: selection.anchor.path,
      match: n => editor.isList(n),
    })
    // 设置列表的缩进
    if (entry) {
      toggleListIndent(editor, entry, size, mode)
    } else {
      toggleNormalIndent(editor, size, mode)
    }
  })
}

export const withIndent = <T extends Editable>(editor: T, options: IndentOptions = {}) => {
  const newEditor = editor as T & IndentEditor

  INDENT_OPTIONS.set(newEditor, options)

  const size = IndentEditor.getSize(editor)

  newEditor.toggleIndent = mode => {
    toggleIndent(newEditor, size, mode)
  }

  newEditor.toggleOutdent = () => {
    toggleIndent(newEditor, -size)
  }

  newEditor.onIndentMatch = (n: Node, path: Path) => {
    if (editor.isList(n)) {
      return true
    } else if (Editor.above(newEditor, { match: n => editor.isList(n), at: path })) {
      return false
    }
    return Editor.isBlock(editor, n)
  }

  const { renderElement, renderElementAttributes } = newEditor

  newEditor.renderElementAttributes = props => {
    return renderIndentAttributes(newEditor, props, renderElementAttributes)
  }

  newEditor.renderElement = props => {
    return renderIndent(newEditor, props, renderElement)
  }

  const { onKeydown, isInline, isVoid, canFocusVoid } = newEditor

  newEditor.isInline = (el: Element) => {
    return IndentEditor.isIndent(newEditor, el) || isInline(el)
  }

  newEditor.isVoid = (el: Element) => {
    return IndentEditor.isIndent(newEditor, el) || isVoid(el)
  }

  newEditor.canFocusVoid = (el: Element) => {
    if (IndentEditor.isIndent(newEditor, el)) return false
    return canFocusVoid(el)
  }

  const hotkeys: Hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)
  newEditor.onKeydown = (e: KeyboardEvent) => {
    for (let key in hotkeys) {
      const type = key as IndentPluginType
      const hotkey = hotkeys[type]
      const toggle = () => {
        e.preventDefault()
        if (type === 'outdent') newEditor.toggleOutdent()
        else newEditor.toggleIndent()
      }
      if (
        (typeof hotkey === 'string' && Hotkey.is(hotkey, e)) ||
        (typeof hotkey === 'function' && hotkey(e))
      ) {
        toggle()
        return
      }
    }
    const { selection } = editor
    if (selection && Range.isCollapsed(selection) && Hotkey.is('backspace', e)) {
      const entry = Editor.above(newEditor, {
        match: newEditor.onIndentMatch,
      })
      const active = IndentEditor.queryActive(newEditor)
      if (
        active &&
        active.level > 0 &&
        entry &&
        Editor.isStart(editor, selection.focus, entry[1])
      ) {
        newEditor.toggleOutdent()
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
    match: n => Editor.isBlock(editor, n) && (n as Indent).lineIndent !== undefined,
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

export * from './types'
