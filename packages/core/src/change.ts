import { EVENT_SELECTION_CHANGE } from "@editablejs/constants"
import { IModel, INode, Text, Element, TextFormat } from "@editablejs/model"
import { IRange, ISelection } from "@editablejs/selection"
import { Log } from "@editablejs/utils"
import { IChange } from "./types"

class Change implements IChange {

  private _cacheFormat?: TextFormat

  model: IModel
  selection: ISelection

  constructor(model: IModel, selection: ISelection) {
    selection.on(EVENT_SELECTION_CHANGE, () => {
      this._cacheFormat = undefined
    })
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
      const node = this.model.getNode(key)
      if(!node) Log.nodeNotFound(key)
      if(Text.isText(node)) {
        if(offset > 0) {
          this.model.deleteText(key, offset - 1, 1);
        }
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
        if(offset + 1 <= text.length) this.model.deleteText(key, offset, 1);
      }
    }
  }

  deleteContents(){
    const range = this.getRange()
    if(!range) return
    if(range.isCollapsed) {
      this.deleteBackward()
      return
    }
    const ranges = this.selection.getSubRanges()
    for (let i = ranges.length - 1; i >= 0; i--) { 
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
    if(this._cacheFormat) {
      const node = Text.create({ text, format: this._cacheFormat })
      this.insertNode(node)
      this._cacheFormat = undefined
    } else {
      const range = this.getRange()
      if(!range) return
      const { key, offset } = range.anchor
      this.model.insertText(text, key, offset);
    }
  }

  insertNode(node: INode){
    const range = this.getRange()
    if(!range) return
    const { key, offset } = range.anchor
    this.model.insertNode(node, key, offset)
  }

  hasCacheFormatting(){
    return !!this._cacheFormat
  }

  setFormat(name: string, value: string | number){
    const range = this.getRange()
    if(!range) return
    const model = this.model
    if(range.isCollapsed) {
      const key = range.anchor.key
      const node = model.getNode(key)
      if(!node) Log.nodeNotFound(key)
      const format = Text.isText(node) ? node.getFormat() : {}
      this._cacheFormat = { ...format, [name]: value }
    } else {
      const subRanges = this.selection.getSubRanges()
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
        } else if(Element.isElement(node)) {
          const children = node.getChildren()
          const child = children[anchor.offset]
          if(Element.isElement(child)) {
            const textNodes = child.filter(Text.isText)
            for(let t = 0; t < textNodes.length; t++) {
              const textNode = textNodes[t]
              const format = textNode.getFormat()
              textNode.setFormat(Object.assign({}, format, { [name]: value }))
              model.applyNode(textNode)
            }
          }
        }
      }
    }
  }

  deleteFormat(name: string){

  }
}

export default Change