import { DATA_KEY, DATA_TYPE, DATA_TYPE_TEXT } from "@editablejs/constants";
import { NodeKey } from "@editablejs/model";
import { IRange, Position, RangeOptions } from "./types";

export default class Range implements IRange {
  private _anchor: Position;
  private _focus: Position;

  constructor(options: RangeOptions) {
    this._anchor = options.anchor;
    this._focus = options.focus ?? this._anchor;
  }

  static create(options: RangeOptions) {
    return new Range(options)
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
    const anchorElement = document.querySelector(`[${DATA_KEY}="${_anchor.key}"]`)
    const focusElement = document.querySelector(`[${DATA_KEY}="${_focus.key}"]`)
    if(!anchorElement || !focusElement) return null
    const type = anchorElement.getAttribute(DATA_TYPE)
    const anchorNode = type === DATA_TYPE_TEXT ? anchorElement.firstChild : anchorElement
    const focusNode = type === DATA_TYPE_TEXT ? focusElement.firstChild : focusElement
    if(!anchorNode || !focusNode) return null
    const isBackward = this.isBackward
    range.setStart(isBackward ? focusNode : anchorNode, isBackward ? _focus.offset : _anchor.offset);
    range.setEnd(isBackward ? anchorNode : focusNode, this.isBackward ? _anchor.offset : _focus.offset);
    return range.getClientRects()
  }

  collapse(start: boolean): void {
    if(start) this._focus = Object.assign({}, this._anchor)
    else this._anchor = Object.assign({}, this._focus)
  }
  
  clone(): IRange {
    return new Range({
      anchor: Object.assign({}, this.anchor),
      focus: Object.assign({}, this.focus)
    })
  }

  equal(range: IRange) {
    const _anchor = this.anchor
    const _focus = this.focus
    const { anchor, focus } = range
    return _anchor.key === anchor.key && _anchor.offset === anchor.offset && _focus.key === focus.key && _focus.offset === focus.offset
  }
}