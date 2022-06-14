import { INode, Text, Element } from "@editablejs/model"
import { Log } from "@editablejs/utils"
import closest from "./closest"

export * from './closest'
export * from './position'
export * from './dom'
export * from './op'

export const assert = (node: INode, offset: number) => {
  const key = node.getKey()
  if(Text.isText(node)) if(offset < 0 || offset > node.getText().length) Log.offsetOutOfRange(key, offset)
  if(Element.isElement(node)) if(offset < 0 || offset > node.getChildrenSize()) Log.offsetOutOfRange(key, offset)
}

export {
  closest
}