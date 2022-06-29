import { NodeInterface, Text, Element } from "@editablejs/model"
import { Log } from "@editablejs/utils"
import closest from "./closest"

export * from './closest'
export * from './position'
export * from './dom'
export * from './op'

export const assert = (node: NodeInterface, offset: number) => {
  const key = node.getKey()
  if(Text.isText(node)) {
    const componsition = node.getComposition()
    let text = node.getText()
    if(componsition) text += componsition.text
    if(offset < 0 || offset > text.length) Log.offsetOutOfRange(key, offset)
  }
  if(Element.isElement(node)) if(offset < 0 || offset > node.getChildrenSize()) Log.offsetOutOfRange(key, offset)
}

export {
  closest
}