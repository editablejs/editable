import { Editable, isHotkey, RenderElementProps } from "@editablejs/editor"
import { CSSProperties } from "react"
import { Editor, Transforms, Node, Element, NodeEntry, Path, Range } from "slate"
import './indent.less'

export interface IndentElement extends Element {
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
  onRenderIndentSize?: (type: IndentType, size: number) => string | number
}

const defaultHotkeys: Hotkeys = { 
  [INDENT_KEY]: 'tab',
  [OUTDENT_KEY]: 'shift+tab',
}

export const INDENT_OPTIONS = new WeakMap<Editable, IndentOptions>()

export interface IndentInterface extends Editable {

  toggleIndent: () => void

  toggleOutdent: () => void

  queryIndentActive: () => Record<IndentType | 'leval', number> | null

  onToggleIndentMatch: (<T extends Node>(node: Node, path: Path) => node is T) | ((node: Node, path: Path) => boolean)

  getIndentLeval: (element: Element) => number
}

export const isIndentEditor = (editor: Editable): editor is IndentInterface => {
  return !!(editor as IndentInterface).toggleIndent
}

const setTextIndent = (editor: Editable, blockEntry: NodeEntry, size: number) => { 
  const [block, path] = blockEntry
  const indentEl = block as IndentElement
  const textIndent = indentEl.textIndent ?? 0
  const lineIndent = indentEl.lineIndent ?? 0
  const indent = Math.max(textIndent + size, 0)
  if(size < 0 && textIndent === 0 && lineIndent > 0) {
    setLineIndent(editor, [block, path], size)
    return
  }
  Transforms.setNodes(editor, { textIndent: indent } as IndentElement, { at: path })
}

const setLineIndent = (editor: Editable, blockEntry: NodeEntry, size: number) => { 
  const [block, path] = blockEntry
  const indentEl = block as IndentElement
  const lineIndent = indentEl.lineIndent ?? 0
  const textIndent = indentEl.textIndent ?? 0
  if(size < 0 && lineIndent === 0 && textIndent > 0) {
    setTextIndent(editor, [block, path], size)
    return
  }
  const indent = Math.max(lineIndent + size, 0)
  Transforms.setNodes(editor, { lineIndent: indent } as IndentElement, { at: path })
}

const toggleIndent = (editor: IndentInterface, size: number) => {
  const { selection } = editor
  if(!selection) return
  const selectLine = Editable.getSelectLine(editor)
  const selectLineEdge = Editable.isSelectLineEdge(editor)
  // text indent
  if(!selectLine) {
    const entry = Editor.above(editor, { match: editor.onToggleIndentMatch})
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
    const blockEntrys = Editor.nodes(editor, { match: editor.onToggleIndentMatch})
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
  } as IndentElement, {
    at: selection
  })
}

const queryIndentActive = (editor: Editable) => { 
  const elements = editor.queryActiveElements()
  for(const type in elements) { 
    const { textIndent, lineIndent } = elements[type] as unknown as IndentElement
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
}

const renderIndent = (editor: Editable, { attributes, element, children }: RenderElementProps<IndentElement>, next: (props: RenderElementProps) => JSX.Element) => {
  const style: CSSProperties = attributes.style ?? {}
  const { onRenderIndentSize } = (INDENT_OPTIONS.get(editor) ?? {})
  const { textIndent, lineIndent, type } = element

  const getIndentSize = (type: IndentType, size: number) => { 
    return onRenderIndentSize ? onRenderIndentSize(type, size) : size
  }
  if(textIndent) { 
    if(type === INDENT_KEY) { 
      children = <span className="editable-indent" style={{width: getIndentSize('text', textIndent)}}>{children}</span>
    } else {
      style.textIndent = getIndentSize('text', textIndent)
    }
  } else {
    delete style.textIndent
  }
  if(lineIndent) { 
    style.paddingLeft = getIndentSize('line', lineIndent)
  } else {
    delete style.paddingLeft
  }
  return next({ attributes: Object.assign({}, attributes, { style }), children, element })
}

export const withIndent = <T extends Editable>(editor: T, options: IndentOptions = {}) => {
  const newEditor = editor as T & IndentInterface

  INDENT_OPTIONS.set(newEditor, options)
  
  const size = options.size ?? DEFAULT_SIZE

  newEditor.toggleIndent = () => { 
    toggleIndent(newEditor, size)
  }

  newEditor.toggleOutdent = () => {
    toggleIndent(newEditor, -size)
  }

  newEditor.queryIndentActive = () => { 
    return queryIndentActive(editor)
  }

  newEditor.onToggleIndentMatch = (n: Node) => {
    return Editor.isBlock(editor, n)
  }

  newEditor.getIndentLeval = (element: IndentElement) => {
    const { textIndent, lineIndent } = element
    const count = (textIndent ?? 0) + (lineIndent ?? 0)
    return count > 0 ? count / size : 0
  }

  const { renderElement } = newEditor

  newEditor.renderElement = (props) => {
    return renderIndent(newEditor, props, renderElement)
  }

  const { onKeydown, isInline, isVoid, canFocusVoid } = newEditor

  const isIndentElement = (element: Element) => { 
    return element.type === INDENT_KEY
  }

  newEditor.isInline = (el: Element) => {
    return isIndentElement(el) || isInline(el)
  }
  
  newEditor.isVoid = (el: Element) => {
    return isIndentElement(el) || isVoid(el)
  }

  newEditor.canFocusVoid = (el: Element) => { 
    if(isIndentElement(el)) return false
    return canFocusVoid(el)
  }

  const hotkeys: Hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)
  newEditor.onKeydown = (e: KeyboardEvent) => { 
    for(let key in hotkeys) {
      const type = key as IndentPluginType
      const hotkey = hotkeys[type]
      const toggle = () => {
        e.preventDefault()
        toggleIndent(newEditor, type === 'outdent' ? -size : size)
      }
      if(typeof hotkey === 'string' && isHotkey(hotkey, e) || typeof hotkey === 'function' && hotkey(e)) {
        toggle()
        return
      }
    }
    const { selection } = editor
    if(selection && Range.isCollapsed(selection) && isHotkey('backspace', e)) { 
      const entry = Editor.above(newEditor, { match: newEditor.onToggleIndentMatch})
      const active = newEditor.queryIndentActive()
      if(active && active.leval > 0 && entry && Editor.isStart(editor, selection.focus, entry[1])){
        newEditor.toggleOutdent()
        return
      }
    }
    onKeydown(e)
  }

  return newEditor
}