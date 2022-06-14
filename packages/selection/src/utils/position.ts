import { DATA_KEY } from "@editablejs/constants"
import { nextBreak, previousBreak } from "@editablejs/grapheme-breaker"
import { IModel, NodeKey, Text, Element, INode, IElement } from "@editablejs/model"
import { Log } from "@editablejs/utils"
import { Position } from "../types"
import closest, { isAlignY } from "./closest"
import { getOffset } from "./text"

export const getPositionToForward = (model: IModel, key: NodeKey, offset: number): Position => {
  let node = model.getNode(key)
  if(!node) Log.nodeNotFound(key)
  let next: INode | null = null
  const position = {
    key,
    offset
  }
  // Text
  if(Text.isText(node)) {
    const text = node.getText()
    if(offset < text.length) {
      const nextOffset = nextBreak(node.getText(), offset)
      position.offset = nextOffset
      return position
    } 
    // offset out of range
    else {
      next = model.getNext(key)
    }
  } 
  // Element
  else if(Element.isElement(node)) {
    const children = node.getChildren()
    
    if(offset < children.length) { 
      position.offset = offset + 1
      return position
    } else {
      next = model.getNext(key)
    }
  }
  let parentNode: IElement | null = null
  // is null
  while(!next) {
    // get parent
    const parentKey: string | null = node.getParentKey()
    if(!parentKey) return position
    parentNode = model.getNode(parentKey)
    if(!parentNode || !Element.isElement(parentNode)) return position
    node = parentNode
    next = model.getNext(parentKey)
  }
  if(!next) return position
  if(Text.isText(next)) {
    position.key = next.getKey()
    position.offset = nextBreak(next.getText(), 0)
    return position
  } 
  if(!Element.isElement(next)) return position
  let first = next.first()
  while(first && Element.isElement(first)) {
    const cFirst = first.first()
    if(cFirst) first = cFirst
    else break
  }
  if(!first) { 
    if(!parentNode) return position
    const offset = parentNode.indexOf(node.getKey())
    position.key = parentNode.getKey()
    position.offset = offset
  } else {
    position.key = first.getKey()
    position.offset = 0
  }
  return position
}

export const getPositionToBackward = (model: IModel, key: NodeKey, offset: number): Position => { 
  let node = model.getNode(key)
  if(!node) Log.nodeNotFound(key)
  let prev: INode | null = null
  const position = {
    key,
    offset
  }
  // Text
  if(Text.isText(node)) {
    const text = node.getText()
    if(offset > 0 && text.length > 0) {
      const prevOffset = previousBreak(node.getText(), offset)
      position.offset = prevOffset
      return position
    } 
    // offset out of range
    else {
      prev = model.getPrev(key)
    }
  } 
  // Element
  else if(Element.isElement(node)) {
    const children = node.getChildren()
    if(offset > 0 && children.length > 0) { 
      position.offset = offset - 1
      return position
    } else {
      prev = model.getPrev(key)
    }
  }
  let parentNode: IElement | null = null
  // is null
  while(!prev) {
    // get parent
    const parentKey: string | null = node.getParentKey()
    if(!parentKey) return position
    parentNode = model.getNode(parentKey)
    if(!parentNode || !Element.isElement(parentNode)) return position
    node = parentNode
    prev = model.getPrev(parentKey)
  }
  if(!prev) return position
  if(Text.isText(prev)) {
    const text = prev.getText()
    position.key = prev.getKey()
    position.offset = previousBreak(text, text.length)
    return position
  } 
  if(!Element.isElement(prev)) return position
  let last = prev.last()
  while(last && Element.isElement(last)) {
    const cLast = last.last()
    if(cLast) last = cLast
    else break
  }
  if(!last) { 
    if(!parentNode) return position
    const offset = parentNode.indexOf(node.getKey())
    position.key = parentNode.getKey()
    position.offset = offset
  } else if(Text.isText(last)) {
    const text = last.getText()
    position.key = last.getKey()
    position.offset = text.length
  } else if(Element.isElement(last)) {
    position.key = last.getKey()
    position.offset = last.getChildren().length
  }
  return position
}

const findNodeFromEvent = (model: IModel, e: MouseEvent) => {
  if (!(e.target instanceof Node)) return
  let targetNode: Node | null = e.target
  let key: NodeKey | null = null
  if(targetNode instanceof globalThis.Text) {
    targetNode = targetNode.parentNode
  }
  let top = e.clientY
  let left = e.clientX
  if(targetNode instanceof globalThis.Element) {
    key = targetNode.getAttribute(DATA_KEY)
    const nodes: globalThis.Element[] = []
    if(!key) {
      let parent = targetNode.parentNode
      while(parent && parent instanceof globalThis.Element) {
        key = parent.getAttribute(DATA_KEY)
        if(key) {
          break
        }
        parent = parent.parentNode
      }
    }
    if(!key) {
      const selector = model.find(obj => {
        if(Text.isTextObject(obj)) {
          return true
        } else if(Element.isElementObject(obj)) {
          return obj.children.length === 0
        }
        return false
      }).map(node => `[${DATA_KEY}="${node.getKey()}"]`).join(',')
      document.querySelectorAll(selector).forEach(node => { 
        if(node instanceof globalThis.Element) {
          nodes.push(node)
        }
      })
    } else {
      const node = model.getNode(key)
      if(!node) return null
      const keys: NodeKey[] = []
      if(Text.isText(node)) {
        keys.push(key)
      } else if(Element.isElement(node)) {
        const findKeys = (node: IElement) => {
          const children = node.getChildren()
          if(children.length === 0) keys.push(node.getKey())
          children.forEach(child => { 
            const childKey = child.getKey()
            if(Text.isText(child)) {
              keys.push(childKey)
            } else if(Element.isElement(child)) {
              findKeys(child)
            }
          })
        }
        findKeys(node)
      }
      const selector = keys.map(key => `[${DATA_KEY}="${key}"]`).join(',')
      document.querySelectorAll(selector).forEach(node => {
        if(node instanceof globalThis.Element) {
          nodes.push(node)
        }
      })
    }
    const closestNodes = closest(nodes, e.x, e.y)
    if(!closestNodes) return
    if(closestNodes instanceof Node) {
      targetNode = closestNodes
    } else {
      const { top: closestTop, left: closestLeft, right: closestRight, below: closestBelow } = closestNodes
      if(closestLeft && closestBelow) {
        if(isAlignY(closestBelow.rect, closestLeft.rect)) {
          targetNode = closestBelow.node
          top = closestBelow.rect.top
        } else {
          targetNode = closestLeft.node
          left = closestLeft.rect.right
        }
      } else if(closestRight && closestBelow) {
        if(isAlignY(closestBelow.rect, closestRight.rect)) {
          targetNode = closestBelow.node
          top = closestBelow.rect.top
        } else {
          targetNode = closestRight.node
          left = closestRight.rect.left
        }
      } else if(closestLeft) {
        targetNode = closestLeft.node
        left = closestLeft.rect.right
      } else if(closestRight) {
        targetNode = closestRight.node
        left = closestRight.rect.left
      } else if(closestBelow) {
        if(left < closestBelow.rect.left) {
          left = closestBelow.rect.left
        } else if(left > closestBelow.rect.right) { 
          left = closestBelow.rect.right
        }
        top = closestBelow.rect.top
        targetNode = closestBelow.node
      } else if(closestTop) {
        targetNode = closestTop.node
        if(left < closestTop.rect.left) {
          left = closestTop.rect.left
        } else if(left > closestTop.rect.right) { 
          left = closestTop.rect.right
        }
        top = closestTop.rect.bottom
      }
    }
    if(targetNode && targetNode instanceof globalThis.Element) {
      key = targetNode.getAttribute(DATA_KEY)
      targetNode = targetNode.firstChild
    }
  }
  if(!key || !(targetNode instanceof globalThis.Text)) return
  return {
    node: targetNode,
    key,
    top,
    left
  }
}

export const getPositionFromEvent = (model: IModel, e: MouseEvent): Position | undefined => { 
  const result = findNodeFromEvent(model, e)
  if(!result) return
  const { key, node, top, left } = result
  const content = node.textContent || ''
  const offset = getOffset(node, left, top, 0, content.length, content.length)
  return {
    key,
    offset
  }
}