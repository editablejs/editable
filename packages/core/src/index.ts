import type { RangeInterface, SelectionInterface } from '@editablejs/selection';
import { createSelection } from '@editablejs/selection';
import { isServer, Log } from '@editablejs/utils';
import type { NodeInterface, Op, TextFormat, TextInterface } from '@editablejs/model'
import { createModel, Element, Text, Node } from '@editablejs/model'
import { EditableInterface, ActiveState } from './types';
import { handleCompositionEnd, handleInput, handleKeyDown } from './typing';

const IS_COMPOSITION_WEAK_MAP = new WeakMap<EditableInterface, boolean>();
const CACHE_FORMAT_WEAK_MAP = new WeakMap<EditableInterface, TextFormat>();
const EDITOR_STATE_WEAK_MAP = new WeakMap<EditableInterface, ActiveState>();

export const createEditable = () => {
  const model = createModel()

  const selection = createSelection(model);

  const editor: EditableInterface = { 
    get isComposition() {
      return IS_COMPOSITION_WEAK_MAP.get(editor) ?? false
    },
  
    getKey() {
      return model.getKey()
    },

    isBlock(node: NodeInterface) {
      return Element.isElement(node)
    },

    isInline(node: NodeInterface) {
      return Text.isText(node)
    },

    isVoid(node: NodeInterface) {
      return false
    },
  
    getRange(): RangeInterface | null {
      return selection.getRangeAt(0)
    },

    getModel() {
      return model
    },

    getSelection(): SelectionInterface {
      return selection
    },
  
    deleteBackward(){
      const range = editor.getRange()
      if(!range) return
      if(range.isCollapsed) {
        const { key, offset } = range.anchor
        const node = model.getNode(key)
        if(!node) Log.nodeNotFound(key)
        if(Text.isText(node)) {
          if(offset > 0) {
            model.deleteText(key, offset - 1, 1);
          }
        }
      }
    },
  
    deleteForward(){
      const range = editor.getRange()
      if(!range) return
      if(range.isCollapsed) {
        const { key, offset } = range.anchor
        const node = model.getNode(key)
        if(!node) Log.nodeNotFound(key)
        if(Text.isText(node)) {
          const text = node.getText()
          if(offset + 1 <= text.length) model.deleteText(key, offset, 1);
        }
      }
    },
  
    deleteContents(){
      const range = editor.getRange()
      if(!range || range.isCollapsed) return
      const ranges = selection.getSubRanges()
      for (let i = ranges.length - 1; i >= 0; i--) { 
        const range = ranges[i]
        const anchor = range.isBackward ? range.focus : range.anchor
        const focus = range.isBackward ? range.anchor : range.focus
        const start = model.getNode(anchor.key)
        const end = model.getNode(focus.key)
        if(!start || !end) break
        if(Text.isText(start)) { 
          model.deleteText(anchor.key, anchor.offset, focus.offset - anchor.offset)
        } else if(Element.isElement(start)) { 
          const children = start.getChildren()
          model.deleteNode(children[anchor.offset].getKey())
        }
      }
    },
  
    insertText(text: string){ 
      if(CACHE_FORMAT_WEAK_MAP.has(editor)) {
        const node = Text.create({ text, format: CACHE_FORMAT_WEAK_MAP.get(editor) })
        editor.insertNode(node)
        CACHE_FORMAT_WEAK_MAP.delete(editor)
      } else {
        editor.deleteContents()
        const range = editor.getRange()
        if(!range) return
        const { key, offset } = range.anchor
        model.insertText(text, key, offset);
      }
    },
  
    insertNode(node: NodeInterface){
      editor.deleteContents()
      const range = editor.getRange()
      if(!range) return
      const { key, offset } = range.anchor
      model.insertNode(node, key, offset)
    },
  
    setFormat(name: string, value: string | number){
      const range = editor.getRange()
      if(!range) return
      if(range.isCollapsed) {
        const key = range.anchor.key
        const node = model.getNode(key)
        if(!node) Log.nodeNotFound(key)
        const format = Text.isText(node) ? node.getFormat() : {}
        CACHE_FORMAT_WEAK_MAP.set(editor, { ...format, [name]: value })
      } else {
        const subRanges = selection.getSubRanges()
        const changedNodes: TextInterface[] = []
        for (let i = 0; i < subRanges.length; i++) { 
          const range = subRanges[i]
          const { anchor, focus } = range
          const node = model.getNode(anchor.key)
          if(!node) continue
          if(Text.isText(node)) {
            const cloneText = node.clone(false, false)
            const text = node.getText()
            const format = node.getFormat()
            cloneText.setText(text.substring(anchor.offset, focus.offset))
            cloneText.setFormat(Object.assign({}, format, { [name]: value }))
            model.deleteText(anchor.key, anchor.offset, focus.offset - anchor.offset)
            model.insertNode(cloneText, anchor.key, anchor.offset)
            changedNodes.push(cloneText)
          } else if(Element.isElement(node)) {
            const children = node.getChildren()
            const child = children[anchor.offset]
            if(Element.isElement(child)) {
              const textNodes = child.matches(Text.isText)
              for(let t = 0; t < textNodes.length; t++) {
                const textNode = textNodes[t]
                const format = textNode.getFormat()
                textNode.setFormat(Object.assign({}, format, { [name]: value }))
                model.applyNode(textNode)
                changedNodes.push(textNode)
              }
            }
          }
          if(changedNodes.length > 0) {
            const start = changedNodes[0]
            const end = changedNodes[changedNodes.length - 1]
            range.setStart(start.getKey(), 0)
            range.setEnd(end.getKey(), end.getText().length)
            selection.applyRange(range)
          }
        }
      }
    },
  
    deleteFormat(name: string){
      const contents = selection.getContents()
  
      const deleteFormat = (node: NodeInterface) => {
        if(Text.isText(node)) {
          const format = node.getFormat()
          delete format[name]
          node.setFormat(format)
          model.applyNode(node)
        } else if(Element.isElement(node)) { 
          const children = node.getChildren()
          for(let c = 0; c < children.length; c++) {
            deleteFormat(children[c])
          }
        }
      }
      for(let i = 0; i < contents.length; i++) {
        const node = contents[i]
        deleteFormat(node)
      }
    },
  
    queryState(): ActiveState {
      const state = EDITOR_STATE_WEAK_MAP.get(editor)
      if(state) return state
      const contents = selection.getContents()
      const data: ActiveState = {
        types: [],
        format: new Map(),
        style: new Map(),
        keys: [],
        nodes: []
      }
      const getState = (node: NodeInterface) => {
        const key = node.getKey()
        const type = node.getType()
        data.keys.push(key)
        if(~~data.types.indexOf(type)) data.types.push(type)
        if(Text.isText(node)) {
          const format = node.getFormat()
          Object.keys(format).forEach(name => { 
            const value = format[name]
            const values = data.format.get(name)
            if(values) {
              values.push(value)
            } else {
              data.format.set(name, [value])
            }
          })
        } else if(Element.isElement(node)) {
          const style = node.getStyle()
          Object.keys(style).forEach(name => { 
            const value = style[name]
            const values = data.style.get(name)
            if(values) {
              values.push(value)
            } else {
              data.style.set(name, [value])
            }
          })
          const children = node.getChildren()
          children.forEach(getState)
        }
        data.nodes.push(node)
      }
      for(let i = 0; i < contents.length; i++) {
        const node = contents[i]
        getState(node)
      }
      EDITOR_STATE_WEAK_MAP.set(editor, data)
      return data
    },
  
    queryFormat(callback: (name: string, value: (string | number)[]) => boolean): boolean {
      const state = editor.queryState()
      const format = state.format
      for(let [name, values] of format) {
        if(callback(name, values)) return true
      }
      return false
    },
  
    queryStyle(callback: (name: string, value: (string | number)[]) => boolean): boolean {
      const state = editor.queryState()
      const style = state.style
      for(let [name, values] of style) {
        if(callback(name, values)) return true
      }
      return false
    },
  
    queryKey(callback: (key: string) => boolean): boolean {
      const state = editor.queryState()
      const keys = state.keys
      return keys.some(callback)
    },
  
    queryNode(callback: (node: NodeInterface) => boolean): boolean {
      const state = editor.queryState()
      const nodes = state.nodes
      return nodes.some(callback)
    },

    onChange(node: NodeInterface, ops: Op[]) { },

    onKeydown(event: KeyboardEvent) { },

    onKeyup(event: KeyboardEvent) { },

    onSelectChange() { },

    onInput(event: InputEvent) { },

    onFocus() { },

    onBlur() { },

    onCompositionStart(event: CompositionEvent) { },

    onCompositionEnd(event: CompositionEvent) { },

    onSelectStart() { },

    onSelecting() { },

    onSelectEnd() { },
  }

  const { isBlock, isInline, isVoid } = model
  model.isBlock = (node) => {
    return editor.isBlock(node) || isBlock(node)
  }
  model.isInline = (node) => {
    return editor.isInline(node) || isInline(node)
  }
  model.isVoid = (node) => { 
    return editor.isVoid(node) || isVoid(node)
  }

  model.onChange = (node, ops) => { 
    EDITOR_STATE_WEAK_MAP.delete(editor)
    editor.onChange(node, ops)
    selection.applyOps(ops)
  }

  const { onSelectChange, onInput, onKeydown, onKeyup, onCompositionStart, onCompositionEnd } = selection 

  selection.onSelectChange = () => {
    onSelectChange()
    EDITOR_STATE_WEAK_MAP.delete(editor)
    editor.onSelectChange()
  }
  
  selection.onInput = (event) => {
    onInput(event)
    editor.onInput(event)
    if(!event.defaultPrevented && event.data) handleInput(event.data, CACHE_FORMAT_WEAK_MAP.has(editor), editor)
  }

  selection.onKeydown = (event) => { 
    editor.onKeydown(event)
    if(!event.defaultPrevented){
      onKeydown(event)
      handleKeyDown(event, editor)
    }
  }

  selection.onKeyup = (event) => {
    editor.onKeyup(event)
    if(!event.defaultPrevented) onKeyup(event)
  }
  
  selection.onCompositionStart = (event: CompositionEvent) => { 
    editor.onCompositionStart(event)
    if(!event.defaultPrevented) {
      IS_COMPOSITION_WEAK_MAP.set(editor, true)
      onCompositionStart(event)
    }
  }

  selection.onCompositionEnd = (event: CompositionEvent) => {  
    editor.onCompositionEnd(event)
    if(!event.defaultPrevented) {
      onCompositionEnd(event)
      IS_COMPOSITION_WEAK_MAP.set(editor, false)
      handleCompositionEnd(event.data, editor)
    }
  }

  return editor
}

if(!isServer) {
  window.Editable = {
    createEditable,
    Element,
    Text,
    Node
  }
}
export * from '@editablejs/model'
export * from '@editablejs/constants'
export * from './types'