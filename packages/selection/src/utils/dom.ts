import { DATA_EDITOR_KEY, DATA_KEY } from "@editablejs/constants"
import { NodeInterface, Text, Element, ModelInterface, NodeKey } from "@editablejs/model"
import { isServer, Log } from "@editablejs/utils"
import { RangeInterface } from "../range"

export const isRenderedToDom = (model: ModelInterface, node: NodeInterface, offset: number) => {
  if(isServer) return false
  const element = queryElements(model, node.getKey())[0]
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
    const element = queryElements(model, child.getKey())[0]
    if(!element) return false
  }
  return true
}

export const isRendered = (model: ModelInterface, range: RangeInterface) => {
  const { anchor, focus } = range
  const anchorNode = model.getNode(anchor.key)
  if(!anchorNode) Log.nodeNotFound(anchor.key)
  if(!isRenderedToDom(model, anchorNode, anchor.offset)) { 
    return false
  } else if(!range.isCollapsed) {
    const focusNode = model.getNode(focus.key)
    if(!focusNode) Log.nodeNotFound(focus.key)
    if(!isRenderedToDom(model, focusNode, focus.offset)) { 
      return false
    }
  }
  return true
}

export const queryElements = (model: ModelInterface, ...keys: NodeKey[]): globalThis.HTMLElement[] => { 
  if(keys.length === 0) return []
  const rootElements = document.querySelectorAll<globalThis.HTMLElement>(`[${DATA_EDITOR_KEY}="${model.getKey()}"]`)
  if(rootElements.length === 0) return []
  const selector = keys.map(key => `[${DATA_KEY}="${key}"]`).join(',')
  const domElements: globalThis.HTMLElement[] = []
  rootElements.forEach((element) => {
    const key = element.getAttribute(DATA_KEY)
    if(key && ~keys.indexOf(key)) {
      domElements.push(element)
    }
    const elements = element.querySelectorAll<globalThis.HTMLElement>(selector)
    elements.forEach(el => domElements.push(el))
  })
  return domElements
}

export const queryElementByKey = (key: NodeKey, container = document): globalThis.HTMLElement | null => { 
  return container.querySelector<globalThis.HTMLElement>(`[${DATA_KEY}="${key}"]`)
}