import { DATA_KEY, DATA_TYPE, DATA_TYPE_TEXT } from "@editablejs/constants";
import { NodeKey } from "@editablejs/model";
import { queryElementByKey } from "./utils";

export interface Position {
  key: NodeKey;
  offset: number
}

export interface RangeInterface {
  readonly anchor: Position
  readonly focus: Position
  readonly isCollapsed: boolean
  readonly isBackward: boolean

  setStart(key: NodeKey, offset: number): void

  setEnd(key: NodeKey, offset: number): void

  getClientRects(): DOMRectList | null

  collapse(start: boolean): void

  clone(): RangeInterface

  equal(range: RangeInterface): boolean
}

export default class Range implements RangeInterface {
  private _anchor: Position;
  private _focus: Position;

  constructor(anchorKey: NodeKey, anchorOffset: number, focusKey?: NodeKey, focusOffset?: number) {
    this._anchor = {
      key: anchorKey,
      offset: anchorOffset
    }
    this._focus = {
      key: focusKey ?? anchorKey,
      offset: focusOffset ?? anchorOffset
    }
  }

  get anchor() {
    return this._anchor
  }

  get focus(){
    return this._focus
  }

  get isCollapsed() { 
    return this.anchor.key === this.focus.key && this.anchor.offset === this.focus.offset
  }

  get isBackward() { 
    if(this.anchor.key === this.focus.key) return this.anchor.offset > this.focus.offset
    const anchorNode = document.querySelector(`[${DATA_KEY}="${this.anchor.key}"]`)
    const focusNode = document.querySelector(`[${DATA_KEY}="${this.focus.key}"]`)
    if(!anchorNode || !focusNode) return false
    const anchorRects = anchorNode.getClientRects()
    const lastRect = anchorRects.item(anchorRects.length - 1)
    if(!lastRect) return false
    const focusRects = focusNode.getClientRects()
    const firstRect = focusRects.item(0)
    if(!firstRect) return false
    return lastRect.top > firstRect.top
  }
  
  setStart(key: NodeKey, offset: number): void {
    this._anchor = {
      key,
      offset
    }
  }

  setEnd(key: NodeKey, offset: number): void {
    this._focus = {
      key,
      offset
    }
  }

  getClientRects(){
    const _anchor = this.anchor
    const _focus = this.focus
    const range = document.createRange();
    const anchorElement = queryElementByKey(_anchor.key)
    const focusElement = queryElementByKey(_focus.key)
    if(!anchorElement || !focusElement) return null

    const isText = (element: HTMLElement) => {
      const type = element.getAttribute(DATA_TYPE)
      return type === DATA_TYPE_TEXT
    }
    const getTextPositon = (element: HTMLElement, offset: number, count = 0): { element: Text, offset: number} | undefined => {
      const len = element.childNodes.length
      for(let i = 0; i < len; i++) {
        const child = element.childNodes[i]
        if(child instanceof Text) { 
          const text = child.textContent ?? ''
          const textLen = text.length
          if(offset <= (textLen + count)) {
            return {
              element: child,
              offset: offset - count
            }
          }
          
          count += text.length
        } else if (child instanceof HTMLElement){
          const position = getTextPositon(child, offset, count)
          console.log(child, position)
          if(position) return position
        }
      }
    }

    const getPosition = (element: HTMLElement, offset: number) => {
      if(isText(element)) {
        return getTextPositon(element, offset)
      }
      return {
        element,
        offset
      }
    }
    const anchorPosition = getPosition(anchorElement, _anchor.offset)
    const focusPosition = this.isCollapsed ? anchorPosition : getPosition(focusElement, _focus.offset)
    if(!anchorPosition || !focusPosition) return null
    const isBackward = this.isBackward
    const anchor = isBackward ? focusPosition : anchorPosition
    const focus = isBackward ? anchorPosition : focusPosition
    range.setStart(anchor.element, anchor.offset);
    range.setEnd(focus.element, focus.offset);
    return range.getClientRects()
  }

  collapse(start: boolean): void {
    if(start) this._focus = Object.assign({}, this._anchor)
    else this._anchor = Object.assign({}, this._focus)
  }
  
  clone(): RangeInterface {
    const { key: anchorKey, offset: anchorOffset } = this.anchor
    const { key: focusKey, offset: focusOffset } = this.focus
    return new Range(anchorKey, anchorOffset, focusKey, focusOffset)
  }

  equal(range: RangeInterface) {
    const _anchor = this.anchor
    const _focus = this.focus
    const { anchor, focus } = range
    return _anchor.key === anchor.key && _anchor.offset === anchor.offset && _focus.key === focus.key && _focus.offset === focus.offset
  }
}