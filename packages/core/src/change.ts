import { IModel, INode, Text, Element } from "@editablejs/model"
import { IRange, ISelection } from "@editablejs/selection"
import { Log } from "@editablejs/utils"
import { IChange } from "./types"

class Change implements IChange {

  model: IModel
  selection: ISelection

  constructor(model: IModel, selection: ISelection) {
    this.model = model
    this.selection = selection
  }
  
  getRange(): IRange | null {
    return this.selection.getRangeAt(0)
  }

  deleteBackward(){
    const range = this.getRange()
    if(!range) return
    if(range.isCollapsed) {
      const { key, offset } = range.anchor
      const deleteOffset = offset - 1
      if(deleteOffset >= 0) {
        this.model.deleteText(key, deleteOffset, 1);
      }
    }
  }

  deleteForward(){
    const range = this.getRange()
    if(!range) return
    if(range.isCollapsed) {
      const { key, offset } = range.anchor
      const node = this.model.getNode(key)
      if(!node) Log.nodeNotFound(key)
      if(Text.isText(node)) {
        const text = node.getText()
        if(offset + 1 < text.length) this.model.deleteText(key, offset, 1);
      }
    }
  }

  deleteContents(){
    const range = this.getRange()
    if(!range) return
    if(range.isCollapsed) {
      this.deleteForward()
      return
    }
    const ranges = this.selection.getSubRanges()
    for (let i = 0; i < ranges.length; i++) { 
      const range = ranges[i]
      const anchor = range.isBackward ? range.focus : range.anchor
      const focus = range.isBackward ? range.anchor : range.focus
      const start = this.model.getNode(anchor.key)
      const end = this.model.getNode(focus.key)
      if(!start || !end) break
      if(Text.isText(start)) { 
        this.model.deleteText(anchor.key, anchor.offset, focus.offset - anchor.offset)
      } else if(Element.isElement(start)) { 
        const children = start.getChildren()
        this.model.deleteNode(children[anchor.offset].getKey())
      }
    }
  }

  insertText(text: string){ 
    const range = this.getRange()
    if(!range) return
    const { key, offset } = range.anchor
    this.model.insertText(text, key, offset);
  }

  insertNode(node: INode){
    const range = this.getRange()
    if(!range) return
    const { key, offset } = range.anchor
    this.model.insertNode(node, key, offset)
  }
}

export default Change