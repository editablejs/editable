import EventEmitter from "@editablejs/event-emitter"
import { ITyping, Position, TypingOptions } from "./types";
import type { IModel } from '@editablejs/model';
import { NodeKey, Text } from '@editablejs/model';
import { EVENT_SELECT_START, EVENT_SELECTING, EVENT_SELECT_END, DATA_KEY } from '@editablejs/constants'
import { getOffset } from "./text";



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

  getNodeFromEvent = (e: MouseEvent) => {
    if (!(e.target instanceof Node)) return
    let targetNode: Node | null = e.target
    let key: NodeKey | null = null
    if(targetNode instanceof globalThis.Text) {
      targetNode = targetNode.parentNode
    }
    if(targetNode instanceof globalThis.Element) {
      key = targetNode.getAttribute(DATA_KEY)
      if(!key) return
      const node = this.model.getNode(key)
      if(node && Text.isText(node)) {
        targetNode = targetNode.firstChild
      } else return
    }
    if(!key || !(targetNode instanceof globalThis.Text)) return
    return {
      node: targetNode,
      key
    }
  }
  
  getPositionFromEvent = (e: MouseEvent): Position | undefined => { 
    const result = this.getNodeFromEvent(e)
    if(!result) return
    const { key, node } = result
    const content = node.textContent || ''
    const offset = getOffset(node, e.clientX, e.clientY, 0, content.length, content.length)
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
    // 暂未考虑鼠标移动时，溢出编辑区域外选中内容的情况
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