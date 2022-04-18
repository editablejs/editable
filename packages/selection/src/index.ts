import EventEmitter from "eventemitter3";
import type { IRange, ISelection, ISelectionLayer, Position, SelectionOptions } from "./types";
import SelectionLayer from "./layer";
import { getOffset } from "./text";
import Range from './range'
export default class Selection extends EventEmitter implements ISelection {
  
  protected options: SelectionOptions;
  private _ranges: IRange[] = [];
  private _startPosition: Position | null = null;
  private _endPosition: Position | null = null;
  private layer: ISelectionLayer 

  constructor(options: SelectionOptions) {
    super();
    this.options = options;
    const { container } = options
    this.layer = new SelectionLayer(container)
    container.addEventListener('mousedown', this.handleMouseDown);
  }

  get anchor() {
    return (this._ranges[0] || null).ahchor;
  }

  get focus() { 
    return (this._ranges[this._ranges.length - 1] || null).focus;
  }

  get isCollapsed() {
    const startRange = this._ranges[0];
    const endRange = this._ranges[this._ranges.length - 1];
    return startRange && endRange && 
    startRange.ahchor.key === endRange.ahchor.key && startRange.ahchor.offset === endRange.focus.offset && 
    startRange.focus.key === endRange.focus.key && startRange.focus.offset === endRange.focus.offset;
  }
  
  getRangeAt(index: number) {
    return this._ranges[index] || null;
  }

  getRangeCount(): number {
    return this._ranges.length;
  }

  getNodeFromEvent = (e: MouseEvent) => {
    if (!e.target) return
    let targetNode: Node | null = e.target as Node
    let key = ''
    if(targetNode instanceof Text) {
      targetNode = targetNode.parentNode
    }
    if(targetNode instanceof Element) {
      const editable = targetNode.getAttribute('data-editable')
      if(editable === 'true' && targetNode.firstChild) {
        key = targetNode.getAttribute('data-key') ?? ''
        targetNode = targetNode.firstChild
      } else return
    } 
    if (targetNode instanceof Text) return {
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
    this._ranges = []
    this._startPosition = position
    this.emit('onSelectStart')
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove = (e: MouseEvent) => { 
    this.handleLayerDraw(e)
    this.emit('onSelecting')
  }

  handleMouseUp = (e: MouseEvent) => { 
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.handleLayerDraw(e)
    if(!this._startPosition || !this._endPosition) { 
      return
    }
    this._ranges.push(new Range({
      anchor: this._startPosition,
      focus: this._endPosition
    }))
    this.emit('onSelectEnd')
  }

  handleLayerDraw = (e: MouseEvent) => { 
    const position = this.getPositionFromEvent(e)
    if(!position || !this._startPosition) return
    this._endPosition = position
    const range = new Range({
      anchor: this._startPosition,
      focus: position
    })
    this.layer.draw(range)
  }

  destroy() { 
    const { container } = this.options
    container.removeEventListener('mousedown', this.handleMouseDown);
  }
}
export {
  ISelection
}