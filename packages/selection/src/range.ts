import { IRange, Position, RangeOptions } from "./types";

export default class Range implements IRange {
  readonly ahchor: Position;
  readonly focus: Position;

  constructor(options: RangeOptions) {
    this.ahchor = options.anchor;
    this.focus = options.focus;
  }

  get isCollapsed() { 
    return this.ahchor.key === this.focus.key && this.ahchor.offset === this.focus.offset
  }

  get isBackward() { 
    if(this.ahchor.key === this.focus.key) return this.ahchor.offset > this.focus.offset
    const ahchorNode = document.querySelector(`[data-key="${this.ahchor.key}"]`)
    const focusNode = document.querySelector(`[data-key="${this.focus.key}"]`)
    if(!ahchorNode || !focusNode) return false
    return ahchorNode.getBoundingClientRect().top > focusNode.getBoundingClientRect().top
  }

  getClientRects(){
    const range = document.createRange();
    const ahchorNode = document.querySelector(`[data-key="${this.ahchor.key}"]`)?.firstChild
    const focusNode = document.querySelector(`[data-key="${this.focus.key}"]`)?.firstChild
    if(!ahchorNode || !focusNode) return null
    const isBackward = this.isBackward
    range.setStart(isBackward ? focusNode : ahchorNode, isBackward ? this.focus.offset : this.ahchor.offset);
    range.setEnd(isBackward ? ahchorNode : focusNode, this.isBackward ? this.ahchor.offset : this.focus.offset);
    return range.getClientRects()
  }
}