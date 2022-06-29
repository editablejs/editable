import isHotkey from "is-hotkey";
import { Element, Text } from '@editablejs/model'
import { EditableInterface } from "./types";

const handleEnter = (event: KeyboardEvent, editor: EditableInterface) => {
  editor.deleteContents()
  const range = editor.getRange()
  if(!range) return
  const model = editor.getModel()
  const { anchor } = range
  const { key, offset } = anchor
  model.splitNode(key, offset, (left, right) => [left, right], (parent, next) => {
    const parentKey: string | null = parent.getParentKey()
    if(!parentKey) return
    const p = model.getNode(parentKey)
    if(!p) return
    if(!Element.isElement(p)) return
    next()
  })
  const selection = editor.getSelection()
  selection.moveToForward()
  event.preventDefault()
}

export const handleKeyDown = (event: KeyboardEvent, editor: EditableInterface) => { 
  const selection = editor.getSelection()
  if(isHotkey('backspace', event)) {
    editor.deleteContents()
  } else if(isHotkey('delete', event)) {
    editor.deleteForward()
  } else if(isHotkey('enter', event)) {
    handleEnter(event, editor)
  } else if(isHotkey('shift+left', event)) {
    selection.moveFocusToBackward();
  } else if(isHotkey('left', event)) {
    selection.moveToBackward();
  } else if(isHotkey('shift+right', event)) {
    selection.moveFocusToForward();
  } else if(isHotkey('right', event)) {
    selection.moveToForward();
  }
}

export const handleInput = (value: string, isCacheFormat: boolean, editor: EditableInterface)  => {
  const model = editor.getModel()
  editor.deleteContents()
  if(editor.isComposition) {
    if(isCacheFormat) {
      editor.insertText('')
    }
    const range = editor.getRange()
    if(!range) return
    const { key, offset } = range.anchor
    const node = model.getNode(key)
    if(!node || !Text.isText(node)) return
    const comosition = node.getComposition()
    node.setComposition({
      text: value,
      offset: comosition?.offset ?? offset
    })
    model.applyNode(node)
  } else {
    editor.insertText(value)
  }
}

export const handleCompositionEnd = (value: string, editor: EditableInterface) => {
  const model = editor.getModel()
  const range = editor.getRange()
  if(!range) return
  const { key } = range.anchor
  const node = model.getNode(key)
  if(node && Text.isText(node)) {
    const composition = node.getComposition()
    if(!composition) return
    node.setComposition()
    model.applyNode(node)
    model.insertText(value, key, composition.offset)
  }
}