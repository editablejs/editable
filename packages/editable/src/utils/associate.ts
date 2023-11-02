import { Editor, Element, Node } from '@editablejs/models'
import { Editable } from "../plugin/editable"
import { EDITOR_TO_KEY_TO_ELEMENT, ELEMENT_TO_NODE, NODE_TO_ELEMENT } from "./weak-maps"


/**
 * @description 关联节点与DOM
 */
export const associateNodeAndDOM = (editor: Editable, node: Node, dom: HTMLElement) => {
  const key = Editable.findKey(editor, node)
  const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
  KEY_TO_ELEMENT?.set(key, dom)
  NODE_TO_ELEMENT.set(node, dom)
  ELEMENT_TO_NODE.set(dom, node)
}

/**
 * @description 更新父节点与DOM的关联
 */
const updateParentNodeAndDOM = (editor: Editable, dom: HTMLElement) => {
  let parentDOM = dom.parentElement
  while (parentDOM) {
    const oldParent = ELEMENT_TO_NODE.get(parentDOM)
    if (oldParent) {
      const oldParentPath = Editable.findPath(editor, oldParent)
      const [newParent] = Editor.node(editor, oldParentPath)
      if (newParent && newParent !== oldParent) {
        associateNodeAndDOM(editor, newParent, parentDOM)
      }
      if (Editor.isEditor(newParent)) break
    }
    parentDOM = parentDOM.parentElement
  }
}

/**
 * @description 更新节点与DOM的关联
 */
export const updateNodeAndDOM = (editor: Editable, node: Node, dom: HTMLElement) => {
  associateNodeAndDOM(editor, node, dom)
  if(Editor.isEditor(node)) return
  updateParentNodeAndDOM(editor, dom)
}

/**
 * @description 删除节点与DOM的关联
 */
export const dissociateNodeAndDOM = (editor: Editable, node: Node) => {
  const key = Editable.findKey(editor, node)
  const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
  KEY_TO_ELEMENT?.delete(key)
  const dom = NODE_TO_ELEMENT.get(node)

  NODE_TO_ELEMENT.delete(node)
  if (dom) {
    ELEMENT_TO_NODE.delete(dom)
    updateParentNodeAndDOM(editor, dom)
  }

  if (Element.isElement(node)) {
    for (const child of node.children) {
      dissociateNodeAndDOM(editor, child)
    }
  }
}
