import { OP_DELETE_TEXT, OP_INSERT_NODE, OP_INSERT_TEXT } from "@editablejs/constants"
import { INode, Op, Text, Element, IText, createNode } from "@editablejs/model"
import { Log } from "@editablejs/utils"
import Range from '../range'

export const createRangefromOp = (op: (Op & Record<'node', INode>)) => { 
  const { type, value, node } = op
  let key = node.getKey()
  let offset = op.offset
  switch(type) {
    case OP_INSERT_TEXT:
      return new Range({
        anchor: {
          key,
          offset: offset + value.length
        }
      })
    case OP_DELETE_TEXT:
      return new Range({
        anchor: {
          key,
          offset
        }
      })
    case OP_INSERT_NODE:
      if(!node) Log.nodeNotFound(key)
      if(Element.isElement(node)) { 
        let child = createNode(value)
        if(child) {
          const createRange = (textNode: IText) => { 
            return new Range({
              anchor: {
                key: textNode.getKey(),
                offset: textNode.getText().length
              }
            })
          }
          if(Text.isText(child)) {
            return createRange(child)
          } 
          while(child && Element.isElement(child)) {
            const last = child.last()
            if(!last) break
            key = child.getKey()
            offset = child.getChildrenSize()
            if(Text.isText(last)) {
              return createRange(last)
            } else {
              child = last
            }
          }
        }
      }
      
      return new Range({
        anchor: {
          key,
          offset
        }
      })
  }
  return new Range({
    anchor: {
      key,
      offset
    }
  })
}