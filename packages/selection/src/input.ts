import { EventEmitter } from "eventemitter3";
import { ILayer } from "./layer";
import { IInput, IRange } from "./types";

export type EventType = 'focus' | 'blur' | 'change' 

export default class Input extends EventEmitter<EventType> implements IInput {
  protected layer: ILayer
  protected textarea: HTMLTextAreaElement
  protected container: HTMLDivElement
  protected composing = false

  constructor(layer: ILayer){
    super()
    this.layer = layer
    const textarea = document.createElement('textarea')
    textarea.setAttribute('rows', '1')
    textarea.setAttribute('style', 'font-size: inherit; line-height: 1; padding: 0px; border: none; white-space: nowrap; width: 1em;overflow: auto;resize: vertical;')
    this.textarea = textarea
    const box = this.layer.createBox('input', { top: 0, left: 0, width: 0, height: 0 })
    box.appendChild(this.textarea)
    this.container = box
    this.layer.appendChild(box)
    this.bindEvents()
  }

  bindEvents = () => {
    const textarea = this.textarea
    textarea.addEventListener('focus', this.handleFocus)
    textarea.addEventListener('blur', this.handleBlur)
    textarea.addEventListener('input', this.handleChange)
    textarea.addEventListener('compositionstart', this.handleCompositionStart)
    textarea.addEventListener('compositionend', this.handleCompositionEnd)
  }

  unbindEvents = () => {
    const textarea = this.textarea
    textarea.removeEventListener('focus', this.handleFocus)
    textarea.removeEventListener('blur', this.handleBlur)
    textarea.removeEventListener('input', this.handleChange)
    textarea.removeEventListener('compositionstart', this.handleCompositionStart)
    textarea.removeEventListener('compositionend', this.handleCompositionEnd)
  }

  handleFocus = (event: FocusEvent) => {
    this.emit('focus', event)
  }

  handleBlur = (event: FocusEvent) => {
    this.emit('blur', event)
  }

  handleChange = (event: Event) => { 
    if(!(event.target instanceof HTMLTextAreaElement)) return
    const value = event.target.value
    this.textarea.value = ''
    this.emit('change', value)
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
    this.layer.updateBox(this.container, rects[0])
    this.focus()
  } 

  destroy = () => { 
    this.layer.clear('input')
    this.unbindEvents()
  }
}