import { DATA_KEY } from "@editablejs/constants"
import { INode, Text, Element, IModel } from "@editablejs/model"
import { Log } from "@editablejs/utils"
import { IRange } from "../types"

export const isRenderedToDom = (node: INode, offset: number) => {
  const element = document.querySelector(`[${DATA_KEY}="${node.getKey()}"]`)
  if(!element) return false
  if(Text.isText(node)) {
    const currentText = node.getText()
    const text = element.textContent
    if(!text || offset > text.length || text !== currentText) return false
  } else if (Element.isElement(node)) {
    const children = node.getChildren()
    if(!children || offset > children.length - 1) return false
    const child = children[offset]
    if(!child) return false
    const element = document.querySelector(`[${DATA_KEY}="${child.getKey()}"]`)
    if(!element) return false
  }
  return true
}

export const isRendered = (model: IModel, range: IRange) => {
  const { anchor, focus } = range
  const anchorNode = model.getNode(anchor.key)
  if(!anchorNode) Log.nodeNotFound(anchor.key)
  if(!isRenderedToDom(anchorNode, anchor.offset)) { 
    return false
  } else if(!range.isCollapsed) {
    const focusNode = model.getNode(focus.key)
    if(!focusNode) Log.nodeNotFound(focus.key)
    if(!isRenderedToDom(focusNode, focus.offset)) { 
      return false
    }
  }
  return true
}