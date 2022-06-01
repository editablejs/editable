import { DATA_KEY } from "@editablejs/constants";
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
    const range = document.createRange();
    const anchorNode = document.querySelector(`[${DATA_KEY}="${this.anchor.key}"]`)?.firstChild
    const focusNode = document.querySelector(`[${DATA_KEY}="${this.focus.key}"]`)?.firstChild
    if(!anchorNode || !focusNode) return null
    const isBackward = this.isBackward
    range.setStart(isBackward ? focusNode : anchorNode, isBackward ? this.focus.offset : this.anchor.offset);
    range.setEnd(isBackward ? anchorNode : focusNode, this.isBackward ? this.anchor.offset : this.focus.offset);
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
}