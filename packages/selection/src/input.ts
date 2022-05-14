import EventEmitter from "@editablejs/event-emitter";
import { EVENT_FOCUS, EVENT_BLUR, EVENT_CHANGE, EVENT_KEYDOWN, EVENT_KEYUP, EVENT_COMPOSITION_START, EVENT_COMPOSITION_END } from '@editablejs/constants'
import { ILayer } from "./layer";
import { DrawRect, IInput } from "./types";


export type InputEventType = typeof EVENT_FOCUS | typeof EVENT_BLUR | typeof EVENT_CHANGE | typeof EVENT_KEYDOWN | typeof EVENT_KEYUP

export default class Input extends EventEmitter<InputEventType> implements IInput {
  protected composing = false
  protected layer: ILayer
  protected textarea: HTMLTextAreaElement
  protected root: HTMLDivElement
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

  get isComposing(){
    return this.composing
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
    textarea.addEventListener('keydown', this.handleKeydown)
    textarea.addEventListener('keyup', this.handleKeyup)
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
    textarea.removeEventListener('keydown', this.handleKeydown)
    textarea.removeEventListener('keyup', this.handleKeyup)
  }

  handleKeydown = (e: KeyboardEvent) => { 
    this.emit(EVENT_KEYDOWN, e)
  }

  handleKeyup = (e: KeyboardEvent) => { 
    this.emit(EVENT_KEYUP, e)
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
    if(!this.composing) {
      this.textarea.value = ''
    }
    this.emit(EVENT_CHANGE, value)
  }

  handleCompositionStart = (ev: CompositionEvent) => {
    this.composing = true
    this.emit(EVENT_COMPOSITION_START, ev)
  }

  handleCompositionEnd = (ev: CompositionEvent) => { 
    this.composing = false
    this.textarea.value = ''
    this.emit(EVENT_COMPOSITION_END, ev)
  }

  focus = () => {
    this.textarea.focus({
      preventScroll: true
    })
  }

  blur = () => {
    this.textarea.blur()
  }

  render = (rect: DrawRect): void => {
    this.layer.updateBox(this.root, Object.assign({}, rect, { color: 'transparent'}))
    this.focus()
  } 

  destroy = () => { 
    this.layer.clear('input')
    this.unbindEvents()
    this.removeAll()
  }
}