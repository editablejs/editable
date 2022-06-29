import { DATA_EDITOR_KEY, DATA_KEY } from "@editablejs/constants"
import { NodeInterface, Text, Element, ModelInterface, NodeKey } from "@editablejs/model"
import { isServer, Log } from "@editablejs/utils"
import { RangeInterface } from "../range"

export const isRenderedToDom = (rootKey: string, node: NodeInterface, offset: number) => {
  if(isServer) return false
  const element = queryElements(queryRootElements(rootKey), node.getKey())[0]
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
    const element = queryElements(queryRootElements(rootKey), child.getKey())[0]
    if(!element) return false
  }
  return true
}

export const isRendered = (model: ModelInterface, range: RangeInterface) => {
  const { anchor, focus } = range
  const anchorNode = model.getNode(anchor.key)
  if(!anchorNode) Log.nodeNotFound(anchor.key)
  if(!isRenderedToDom(model.getKey(), anchorNode, anchor.offset)) { 
    return false
  } else if(!range.isCollapsed) {
    const focusNode = model.getNode(focus.key)
    if(!focusNode) Log.nodeNotFound(focus.key)
    if(!isRenderedToDom(model.getKey(), focusNode, focus.offset)) { 
      return false
    }
  }
  return true
}

export const queryRootElements = (rootKey: string) => {
  const rootElements = document.querySelectorAll<HTMLElement>(`[${DATA_EDITOR_KEY}="${rootKey}"]`)
  return rootElements || []
}

export const queryElements = (containers: NodeListOf<HTMLElement>, ...keys: NodeKey[]): globalThis.HTMLElement[] => { 
  if(keys.length === 0) return []
  if(containers.length === 0) return []
  const selector = keys.map(key => `[${DATA_KEY}="${key}"]`).join(',')
  const domElements: globalThis.HTMLElement[] = []
  containers.forEach((element) => {
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