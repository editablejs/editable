import { EventEmitter } from "eventemitter3"
import isHotkey from "is-hotkey";
import { ITyping, Position, TypingOptions } from "../types";
import { IModel, NodeKey, Text } from '@editablejs/model';
import { getOffset } from "../text";

export const EVENT_SELECT_START = 'onSelectStart'
export const EVENT_SELECTING = 'onSelecting'
export const EVENT_SELECT_END = 'onSelectEnd'

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
      container.removeEventListener('keydown', this.handleKeyDown);
    })
  }

  bindContainers = (...containers: HTMLElement[]) => { 
    containers.forEach(container => {
      container.addEventListener('mousedown', this.handleMouseDown);
      container.addEventListener('keydown', this.handleKeyDown);
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
      key = targetNode.getAttribute('data-key')
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
  
  handleKeyDown = (e: KeyboardEvent) => {
    // if(isHotkey('left', e)) {
    //   if(!this.isCollapsed) {
    //     // shift 
    //     if(isHotkey('shift+left', e)) {

    //     }
    //     // ctrl + shift
    //     if(isHotkey('mod+shift+left', e)) {

    //     }
    //     // ctrl
    //     if(isHotkey('mod+left', e)) {

    //     }
    //     // other

    //   } else {
    //     // 从获取当前offset节点的上一个节点

    //     // 否则当前offset往前移
        
    //   }
    // }
  }

  destroy(): void {
    this.unbindContainersEvents()
    this.removeAllListeners()
  }
}