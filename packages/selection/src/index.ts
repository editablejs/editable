import EventEmitter from "eventemitter3";
import isHotkey from 'is-hotkey'
import type { IInput, IRange, ISelection, Position, SelectionOptions } from "./types";
import Layer from "./layer";
import type { ILayer } from "./layer"
import { getOffset } from "./text";
import Range from './range'
import Input from "./input";
export default class Selection extends EventEmitter implements ISelection {
  
  protected options: SelectionOptions;
  protected ranges: IRange[] = [];
  protected start: Position | null = null;
  protected end: Position | null = null;
  protected layer: ILayer 
  protected input: IInput

  constructor(options: SelectionOptions) {
    super();
    this.options = options;
    const { container } = options
    this.layer = new Layer()
    this.input = new Input(this.layer)
    this.input.on('change', (value: string) => {
      this.emit('valueChange', value)
    })
    container.addEventListener('mousedown', this.handleMouseDown);
    container.addEventListener('keydown', this.handleKeyDown);
  }

  get anchor() {
    return this.getRangeAt(0)?.anchor ?? null;
  }

  get focus() { 
    return this.getRangeAt(this.ranges.length - 1)?.focus ?? null;
  }

  get isCollapsed() {
    const startRange = this.ranges[0];
    const endRange = this.ranges[this.ranges.length - 1];
    return startRange && endRange && 
    startRange.anchor.key === endRange.anchor.key && startRange.anchor.offset === endRange.focus.offset && 
    startRange.focus.key === endRange.focus.key && startRange.focus.offset === endRange.focus.offset;
  }
  
  getRangeAt = (index: number) => {
    return this.ranges.at(index) ?? null;
  }

  getRangeCount = (): number => {
    return this.ranges.length;
  }

  addRange = (range: IRange) => {
    this.ranges.push(range);
    this.emit('onChange');
  }

  removeRangeAt = (index: number) => { 
    this.ranges.splice(index, 1);
    this.emit('onChange');
  }

  removeAllRange(): void {
    this.ranges = [];
    this.emit('onChange');
  }

  getNodeFromEvent = (e: MouseEvent) => {
    if (!e.target) return
    let targetNode: Node | null = e.target as Node
    let key = ''
    if(targetNode instanceof Text) {
      targetNode = targetNode.parentNode
    }
    if(targetNode instanceof Element) {
      const editableLeaf = targetNode.getAttribute('data-editable-leaf')
      if(editableLeaf === 'true' && targetNode.firstChild) {
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
    this.ranges = []
    this.start = position
    this.emit('onSelectStart')
    if(e.button === 0) {
      document.addEventListener('mousemove', this.handleMouseMove);
    }
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove = (e: MouseEvent) => { 
    // 暂未考虑鼠标移动时，溢出编辑区域外选中内容的情况
    this.handleLayerDraw(e)
    this.emit('onSelecting')
    this.emit('onChange');
  }

  handleMouseUp = (e: MouseEvent) => { 
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.handleLayerDraw(e)
    if(!this.start || !this.end) { 
      return
    }
    this.ranges.push(new Range({
      anchor: this.start,
      focus: this.end
    }))
    this.emit('onSelectEnd')
  }

  handleLayerDraw = (e: MouseEvent) => { 
    if(!this.start) return
    const position = e.button === 0 ? this.getPositionFromEvent(e) : this.start
    if(!position) return
    this.end = position
    const range = new Range({
      anchor: this.start,
      focus: position
    })
    this.layer.draw(range)
    this.input.render(range)
  }
  
  handleKeyDown = (e: KeyboardEvent) => {
    if(isHotkey('left', e)) {
      if(!this.isCollapsed) {
        // shift 
        if(isHotkey('shift+left', e)) {

        }
        // ctrl + shift
        if(isHotkey('mod+shift+left', e)) {

        }
        // ctrl
        if(isHotkey('mod+left', e)) {

        }
        // other

      } else {
        // 从获取当前offset节点的上一个节点

        // 否则当前offset往前移
        
      }
    }
  }

  destroy() { 
    const { container } = this.options
    container.removeEventListener('mousedown', this.handleMouseDown);
    this.input.destroy()
    this.layer.destroy()
  }
}
export {
  ISelection
}