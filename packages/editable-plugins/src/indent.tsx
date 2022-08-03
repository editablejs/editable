import { Editable, ElementAttributes, isHotkey, RenderElementAttributes, RenderElementProps } from "@editablejs/editor"
import { CSSProperties } from "react"
import { Editor, Transforms, Node, Element, NodeEntry, Path, Range } from "slate"
import './indent.less'

export interface Indent extends Element {
  /**
   * The indentation level of the text.
   */
  textIndent?: number
  /**
   * The indentation level of the element.
   */
  lineIndent?: number
}

type IndentType = 'text' | 'line'

const INDENT_KEY = 'indent'
const OUTDENT_KEY = 'outdent'
const DEFAULT_SIZE = 32

type IndentPluginType = typeof INDENT_KEY | typeof OUTDENT_KEY

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

  toggleIndent: () => void

  toggleOutdent: () => void

  onIndentMatch: (<T extends Node>(node: Node, path: Path) => node is T) | ((node: Node, path: Path) => boolean)
}

export const IndentEditor = {
  isIndentEditor: (editor: Editable): editor is IndentEditor => {
    return !!(editor as IndentEditor).toggleIndent
  },

  isIndent: (editor: Editable, node: Node): node is Indent => { 
    return Element.isElement(node) && node.type === INDENT_KEY
  },

  queryActive: (editor: Editable) => { 
    const elements = editor.queryActiveElements()
    for(const type in elements) { 
      const { textIndent, lineIndent } = elements[type] as unknown as Indent
      if(textIndent || lineIndent) { 
        const text = textIndent ?? 0
        const line = lineIndent ?? 0
        const options = INDENT_OPTIONS.get(editor) ?? {}
        const size = options.size ?? DEFAULT_SIZE
        const all = text + line
        const leval = all < 1 ? 0 : (text + line) / size
        return {
          text,
          line,
          leval
        }
      }
    }
    return null
  },

  getOptions: (editor: Editable): IndentOptions => { 
    return INDENT_OPTIONS.get(editor) ?? {}
  },

  getSize: (editor: Editable): number => { 
    const options = INDENT_OPTIONS.get(editor) ?? {}
    return options.size ?? DEFAULT_SIZE
  },

  getLeval: (editor: Editable, element: Indent) => {
    const { textIndent, lineIndent } = element
    const count = (textIndent ?? 0) + (lineIndent ?? 0)
    const size = IndentEditor.getSize(editor)
    return count > 0 ? count / size : 0
  },

  addTextIndent: (editor: Editable, path: Path, sub = false) => {
    const element = Node.get(editor, path)
    if(Element.isElement(element)) {
      const size = IndentEditor.getSize(editor)
      setTextIndent(editor, [element, path], sub ? -size : size)
    }
  },

  addLineIndent: (editor: Editable, path: Path, sub = false) => {
    const element = Node.get(editor, path)
    if(Element.isElement(element)) {
      const size = IndentEditor.getSize(editor)
      setLineIndent(editor, [element, path], sub ? -size : size)
    }
  },

  removeIndent: (editor: Editable, path: Path) => {
    const element = Node.get(editor, path)
    if(Element.isElement(element)) {
      setLineIndent(editor, [element, path], -99999)
    }
  },
}

const setTextIndent = (editor: Editable, blockEntry: NodeEntry<Indent>, size: number) => { 
  const [block, path] = blockEntry
  const textIndent = block.textIndent ?? 0
  const lineIndent = block.lineIndent ?? 0
  const indent = Math.max(textIndent + size, 0)
  if(size < 0 && textIndent === 0 && lineIndent > 0) {
    setLineIndent(editor, [block, path], size)
    return
  }
  Transforms.setNodes<Indent>(editor, { textIndent: indent }, { at: path })
}

const setLineIndent = (editor: Editable, blockEntry: NodeEntry<Indent>, size: number) => { 
  const [block, path] = blockEntry
  const lineIndent = block.lineIndent ?? 0
  const textIndent = block.textIndent ?? 0
  if(size < 0 && lineIndent === 0 && textIndent > 0) {
    setTextIndent(editor, [block, path], size)
    return
  }
  const indent = Math.max(lineIndent + size, 0)
  Transforms.setNodes(editor, { lineIndent: indent } as Indent, { at: path })
}

const getIndentSize = (editor: Editable, type: IndentType, size: number) => { 
  const { onRenderSize } = (INDENT_OPTIONS.get(editor) ?? {})
  return onRenderSize ? onRenderSize(type, size) : size
}

const renderIndent = (editor: Editable, { attributes, element, children }: RenderElementProps<Indent>, next: (props: RenderElementProps) => JSX.Element) => {
  const style: CSSProperties = attributes.style ?? {}
 
  const { textIndent, type } = element

  if(textIndent && type === INDENT_KEY) { 
    children = <span className="editable-indent" style={{width: getIndentSize(editor, 'text', textIndent)}}>{children}</span>
  } 
  return next({ attributes: Object.assign({}, attributes, { style }), children, element })
}

export const renderIndentAttributes = (editor: Editable, { attributes, element }: RenderElementAttributes<Indent>, next: (props: RenderElementAttributes) => ElementAttributes) => {
  const { textIndent, lineIndent, type } = element
  const style: CSSProperties = attributes.style ?? {}
  if(textIndent && type !== INDENT_KEY) { 
    style.textIndent = getIndentSize(editor, 'text', textIndent)
  } else {
    delete style.textIndent
  }
  if(lineIndent) { 
    style.paddingLeft = getIndentSize(editor, 'line', lineIndent)
  } else {
    delete style.paddingLeft
  }
  return next({ attributes: Object.assign({}, attributes, { style }), element })
}

const toggleIndent = (editor: IndentEditor, size: number) => { 
  const { selection } = editor
  if(!selection) return
  const selectLine = Editable.getSelectLine(editor)
  const selectLineEdge = Editable.isSelectLineEdge(editor)
  // text indent
  if(!selectLine) {
    const entry = Editor.above(editor, { match: editor.onIndentMatch})
    if(!entry) return
    const [_, path] = entry
    if(Editor.isStart(editor, selection.focus, path)) {
      setTextIndent(editor, entry, size)
      return
    } else if(selectLineEdge) {
      if(size > 0) {
        setTextIndent(editor, entry, -size)
      }
      setLineIndent(editor, entry, size)
    }
  } 
  // line indent
  else if(selectLine) {
    const blockEntrys = Editor.nodes<Indent>(editor, { match: editor.onIndentMatch})
    if(!blockEntrys) return
    for(const entry of blockEntrys) { 
      setLineIndent(editor, entry, size)
    }
    return
  }

  Transforms.insertNodes(editor, {
    type: INDENT_KEY,
    textIndent: Math.abs(size),
    children: [],
  } as Indent, {
    at: selection
  })
}

export const withIndent = <T extends Editable>(editor: T, options: IndentOptions = {}) => {
  const newEditor = editor as T & IndentEditor

  INDENT_OPTIONS.set(newEditor, options)
  
  const size = IndentEditor.getSize(editor)

  newEditor.toggleIndent = () => { 
    toggleIndent(newEditor, size)
  }

  newEditor.toggleOutdent = () => {
    toggleIndent(newEditor, -size)
  }

  newEditor.onIndentMatch = (n: Node) => {
    return Editor.isBlock(editor, n)
  }

  const { renderElement, renderElementAttributes } = newEditor
  
  newEditor.renderElementAttributes = (props) => { 
    return renderIndentAttributes(newEditor, props, renderElementAttributes)
  }

  newEditor.renderElement = (props) => {
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
    if(IndentEditor.isIndent(newEditor, el)) return false
    return canFocusVoid(el)
  }

  const hotkeys: Hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)
  newEditor.onKeydown = (e: KeyboardEvent) => { 
    for(let key in hotkeys) {
      const type = key as IndentPluginType
      const hotkey = hotkeys[type]
      const toggle = () => {
        e.preventDefault()
        if(type === 'outdent') newEditor.toggleOutdent()
        else newEditor.toggleIndent()
      }
      if(typeof hotkey === 'string' && isHotkey(hotkey, e) || typeof hotkey === 'function' && hotkey(e)) {
        toggle()
        return
      }
    }
    const { selection } = editor
    if(selection && Range.isCollapsed(selection) && isHotkey('backspace', e)) { 
      const entry = Editor.above(newEditor, { match: newEditor.onIndentMatch})
      const active = IndentEditor.queryActive(newEditor)
      if(active && active.leval > 0 && entry && Editor.isStart(editor, selection.focus, entry[1])){
        newEditor.toggleOutdent()
        return
      }
    }
    onKeydown(e)
  }

  return newEditor
}