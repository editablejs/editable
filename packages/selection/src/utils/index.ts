import { INode, Text, Element } from "@editablejs/model"
import { Log } from "@editablejs/utils"

export * from './node'

export const assert = (node: INode, offset: number) => {
  const key = node.getKey()
  if(Text.isText(node)) if(offset < 0 || offset > node.getText().length) Log.offsetOutOfRange(key, offset)
  if(Element.isElement(node)) if(offset < 0 || offset > node.getChildrenSize()) Log.offsetOutOfRange(key, offset)
}