import { IRange, Position, RangeOptions } from "./types";

export default class Range implements IRange {
  private _anchor: Position;
  private _focus: Position;

  constructor(options: RangeOptions) {
    this._anchor = options.anchor;
    this._focus = options.focus;
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
    const anchorNode = document.querySelector(`[data-key="${this.anchor.key}"]`)
    const focusNode = document.querySelector(`[data-key="${this.focus.key}"]`)
    if(!anchorNode || !focusNode) return false
    const anchorRects = anchorNode.getClientRects()
    const lastRect = anchorRects.item(anchorRects.length - 1)
    if(!lastRect) return false
    const focusRects = focusNode.getClientRects()
    const firstRect = focusRects.item(0)
    if(!firstRect) return false
    return lastRect.top > firstRect.top
  }

  getClientRects(){
    const range = document.createRange();
    const anchorNode = document.querySelector(`[data-key="${this.anchor.key}"]`)?.firstChild
    const focusNode = document.querySelector(`[data-key="${this.focus.key}"]`)?.firstChild
    if(!anchorNode || !focusNode) return null
    const isBackward = this.isBackward
    range.setStart(isBackward ? focusNode : anchorNode, isBackward ? this.focus.offset : this.anchor.offset);
    range.setEnd(isBackward ? anchorNode : focusNode, this.isBackward ? this.anchor.offset : this.focus.offset);
    return range.getClientRects()
  }
  
  clone(): IRange {
    return new Range({
      anchor: { ...this.anchor },
      focus: { ...this.focus }
    })
  }
  
  collapse(start: boolean): void {
    if(start) this._focus = { ...this._anchor }
    else this._anchor = { ...this._focus }
  }
}