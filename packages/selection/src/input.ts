import { EventEmitter } from "eventemitter3";
import { ILayer } from "./layer";
import { IInput, IRange } from "./types";

export const EVENT_FOCUS = 'onFocus'
export const EVENT_BLUR = 'onBlur'
export const EVENT_CHANGE = 'onChange'
export type InputEventType = typeof EVENT_FOCUS | typeof EVENT_BLUR | typeof EVENT_CHANGE

export default class Input extends EventEmitter<InputEventType> implements IInput {
  protected layer: ILayer
  protected textarea: HTMLTextAreaElement
  protected root: HTMLDivElement
  protected composing = false
  protected containers: HTMLElement[] = []
  private isContainerMouseDown = false
  private _isFocus = false
  private set isFocus(value: boolean){ 
    if(this._isFocus === value) return
    if(value) {
      this.emit(EVENT_FOCUS)
    } else {
      this.emit(EVENT_BLUR)
    }
    this._isFocus = value
  }

  constructor(layer: ILayer){
    super()
    this.layer = layer
    const textarea = document.createElement('textarea')
    textarea.setAttribute('rows', '1')
    textarea.setAttribute('style', 'font-size: inherit; line-height: 1; padding: 0px; border: none; white-space: nowrap; width: 1em;overflow: auto;resize: vertical;')
    this.textarea = textarea
    const box = this.layer.createBox('input', { top: 0, left: 0, width: 0, height: 0 })
    box.appendChild(this.textarea)
    this.root = box
    this.layer.appendChild(box)
    this.bindEvents()
  }

  bindContainers(...containers: HTMLElement[]) { 
    this.unbindContainersEvents()
    containers.forEach(container => {
      container.addEventListener('mousedown', this.handleContainerMouseDown);
    })
  }

  bindEvents = () => {
    document.body.addEventListener('mousedown', this.handleDomMouseDown)
    document.body.addEventListener('mouseup', this.handleDomMouseUp)
    const textarea = this.textarea
    // textarea.addEventListener('focus', this.handleFocus)
    textarea.addEventListener('blur', this.handleBlur)
    textarea.addEventListener('input', this.handleChange)
    textarea.addEventListener('compositionstart', this.handleCompositionStart)
    textarea.addEventListener('compositionend', this.handleCompositionEnd)
  }

  unbindContainersEvents = () => {
    this.containers.forEach(container => {
      container.removeEventListener('mousedown', this.handleContainerMouseDown);
    })
  }

  unbindEvents = () => {
    this.unbindContainersEvents()
    document.body.removeEventListener('mousedown', this.handleDomMouseDown)
    document.body.removeEventListener('mouseup', this.handleDomMouseUp)
    const textarea = this.textarea
    // textarea.removeEventListener('focus', this.handleFocus)
    textarea.removeEventListener('blur', this.handleBlur)
    textarea.removeEventListener('input', this.handleChange)
    textarea.removeEventListener('compositionstart', this.handleCompositionStart)
    textarea.removeEventListener('compositionend', this.handleCompositionEnd)
  }

  handleContainerMouseDown = () => { 
    this.isContainerMouseDown = true
    this.isFocus = true
  }

  handleDomMouseUp = () => {
    this.isContainerMouseDown = false
  }

  handleDomMouseDown = () => {
    if(!this.isContainerMouseDown) this.isFocus = false
  }

  handleFocus = () => {
    this.isFocus = true
  }

  handleBlur = () => {
    if(!this.isContainerMouseDown) this.isFocus = false
  }

  handleChange = (event: Event) => { 
    if(!(event.target instanceof HTMLTextAreaElement)) return
    const value = event.target.value
    this.textarea.value = ''
    this.emit(EVENT_CHANGE, value)
  }

  handleCompositionStart = () => {
    this.composing = true
  }

  handleCompositionEnd = () => { 
    this.composing = false
  }

  focus = () => {
    this.textarea.focus({
      preventScroll: true
    })
  }

  blur = () => {
    this.textarea.blur()
  }

  render = (range: IRange): void => {
    const cloneRange = range.clone()
    cloneRange.collapse(false)
    const rects = cloneRange.getClientRects()
    if(!rects) return
    this.layer.updateBox(this.root, rects[0])
    this.focus()
  } 

  destroy = () => { 
    this.layer.clear('input')
    this.unbindEvents()
    this.removeAllListeners()
  }
}