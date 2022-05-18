import EventEmitter from "@editablejs/event-emitter"
import type { ITyping, Position, TypingOptions } from "./types";
import { NodeKey, IModel, Element, Text, IElement } from '@editablejs/model';
import { EVENT_SELECT_START, EVENT_SELECTING, EVENT_SELECT_END, DATA_KEY } from '@editablejs/constants'
import { getOffset } from "./text";
import { findClosestNodes, isAlignY } from "./utils";


export type TypingEventType = typeof EVENT_SELECT_START | typeof EVENT_SELECTING | typeof EVENT_SELECT_END
export default class Typing extends EventEmitter<TypingEventType> implements ITyping {
  protected containers: HTMLElement[] = []
  protected model: IModel
  constructor(options: TypingOptions) { 
    super()
    const { model } = options
    this.model = model
  }

  unbindContainersEvents = () => {
    this.containers.forEach(container => {
      container.removeEventListener('mousedown', this.handleMouseDown);
    })
  }

  bindContainers = (...containers: HTMLElement[]) => { 
    this.unbindContainersEvents()
    containers.forEach(container => {
      container.addEventListener('mousedown', this.handleMouseDown);
    })
  }

  findNodeFromEvent = (e: MouseEvent) => {
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
        const selector = this.model.find(obj => {
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
        const node = this.model.getNode(key)
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
      const closestNodes = findClosestNodes(nodes, e.x, e.y)
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
  
  getPositionFromEvent = (e: MouseEvent): Position | undefined => { 
    const result = this.findNodeFromEvent(e)
    if(!result) return
    const { key, node, top, left } = result
    const content = node.textContent || ''
    const offset = getOffset(node, left, top, 0, content.length, content.length)
    return {
      key,
      offset
    }
  }
  
  handleMouseDown = (e: MouseEvent) => { 
    const position = this.getPositionFromEvent(e)
    if(!position) return
    this.emit(EVENT_SELECT_START, position)
    if(e.button === 0) {
      document.addEventListener('mousemove', this.handleMouseMove);
    }
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove = (e: MouseEvent) => { 
    this.emit(EVENT_SELECTING, this.getPositionFromEvent(e))
  }

  handleMouseUp = (e: MouseEvent) => { 
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.emit(EVENT_SELECT_END, this.getPositionFromEvent(e))
  }

  destroy(): void {
    this.unbindContainersEvents()
    this.removeAll()
  }
}