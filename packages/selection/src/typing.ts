import EventEmitter from "@editablejs/event-emitter"
import { IModel } from '@editablejs/model';
import { EVENT_SELECT_START, EVENT_SELECTING, EVENT_SELECT_END, DATA_KEY, EVENT_DOM_RENDER, EVENT_ROOT_DOM_RENDER } from '@editablejs/constants'
import type { ITyping, TypingOptions } from "./types";
import {  getPositionFromEvent } from "./utils";


export type TypingEventType = typeof EVENT_SELECT_START | typeof EVENT_SELECTING | typeof EVENT_SELECT_END
export default class Typing extends EventEmitter<TypingEventType> implements ITyping {
  protected containers: Map<string, HTMLElement> = new Map()
  protected model: IModel
  protected mutationMap = new Map<HTMLElement, MutationObserver>()
  protected mutationRoot?: MutationObserver
  constructor(options: TypingOptions) { 
    super()
    const { model } = options
    this.model = model
    const mutation = new MutationObserver((mutations: MutationRecord[]) => {
      const keys = this.model.getRootKeys()
      // let hasRendered = false

      // const hasRenderedFromElement = (element: HTMLElement, callback: (key: string) => boolean = (key => keys.includes(key))) => { 
      //   const key = element.getAttribute(DATA_KEY)
      //   if(key && callback(key)) {
      //     hasRendered = true
      //     return true
      //   }
      //   return false
      // }

      // const hasRenderedFromChild = (element: HTMLElement, callback?: (key: string) => boolean): boolean => { 
      //   if(hasRendered || hasRenderedFromElement(element, callback)) return true
      //   for(let c = 0; c < element.children.length; c++) {
      //     const child = element.children[c]
      //     if(child instanceof HTMLElement) {
      //       hasRenderedFromChild(child, callback)
      //     }
      //     if(hasRendered) return true
      //   }
      //   return false
      // }

      // for(let i = 0; i < mutations.length; i++) { 
      //   const { addedNodes, removedNodes } = mutations[i]
      //   for(let a = 0; a < addedNodes.length; a++) { 
      //     const addedNode = addedNodes[a]
      //     if(addedNode instanceof HTMLElement) { 
      //       if(hasRenderedFromChild(addedNode)) {
      //         hasRendered = true
      //         break
      //       }
      //     }
      //     for(let r = 0; r < removedNodes.length; r++) { 
      //       const removedNode = removedNodes[r]
      //       if(removedNode instanceof HTMLElement) { 
      //         if(hasRenderedFromChild(removedNode, this.containers.has)) {
      //           hasRendered = true
      //           break
      //         }
      //       }
      //     }
      //     if(hasRendered) break
      //   }
      //   if(hasRendered) this.updateContainers(keys)
      // }
      this.updateContainers(keys)
    })
    this.mutationRoot = mutation
  }

  startMutationRoot = () => {
    this.mutationRoot?.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  stopMutationRoot = () => {
    this.mutationRoot?.disconnect()
  }

  updateContainers = (keys: string[]) => { 
    let isChange = false
    const domSelector = keys.map(key => `[${DATA_KEY}="${key}"]`).join(',')
    const containerList = keys.length > 0 ? document.querySelectorAll(domSelector) : []
    const containers: HTMLElement[] = Array.from(containerList) as HTMLElement[]
    this.containers.forEach((container, key) => {
      if(!containers.includes(container)) { 
        this.unbindContainer(container)
        this.containers.delete(key)
        isChange = true
      }
    })
    containers.forEach(container => {
      const key = container.getAttribute(DATA_KEY)
      if(!key) return
      const oldContainer = this.containers.get(key)
      if(!oldContainer) { 
        this.containers.set(key, container)
        this.bindContainer(container)
        isChange = true
      } else if(oldContainer !== container) {
        this.containers.set(key, container)
        this.unbindContainer(oldContainer)
        this.bindContainer(container)
        isChange = true
      }
    })
    if(isChange) this.emit(EVENT_ROOT_DOM_RENDER, this.containers)
  }

  bindContainer = (container: HTMLElement) => {
    container.addEventListener('mousedown', this.handleMouseDown);
    const mutation = new MutationObserver((mutations: MutationRecord[]) => {
      this.emit(EVENT_DOM_RENDER, mutations)
    })
    mutation.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    this.mutationMap.set(container, mutation)
  }

  unbindContainer = (container: HTMLElement): void => {
    container.removeEventListener('mousedown', this.handleMouseDown);
    const observer = this.mutationMap.get(container)
    if(observer) {
      observer.disconnect()
      this.mutationMap.delete(container)
    }
  }

  unbindContainers = () => {
    this.containers.forEach(this.unbindContainer)
    this.containers.clear()
  }
  
  handleMouseDown = (e: MouseEvent) => { 
    const position = getPositionFromEvent(this.model, e)
    if(!position) return
    this.emit(EVENT_SELECT_START, position)
    if(e.button === 0) {
      document.addEventListener('mousemove', this.handleMouseMove);
    }
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove = (e: MouseEvent) => { 
    const position = getPositionFromEvent(this.model, e)
    this.emit(EVENT_SELECTING, position)
  }

  handleMouseUp = (e: MouseEvent) => { 
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.emit(EVENT_SELECT_END, getPositionFromEvent(this.model, e))
  }

  destroy(): void {
    this.stopMutationRoot()
    this.unbindContainers()
    this.removeAll()
  }
}