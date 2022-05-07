import EventEmitter from "@editablejs/event-emitter";
import { Element, IModel, NodeKey, Text, INode, Op } from '@editablejs/model';
import { Log } from '@editablejs/utils'
import { EVENT_FOCUS, EVENT_BLUR, EVENT_CHANGE, EVENT_KEYDOWN, EVENT_KEYUP, EVENT_SELECT_START, EVENT_SELECT_END, EVENT_SELECTING, EVENT_VALUE_CHANGE, EVENT_SELECTION_CHANGE, EVENT_NODE_DID_UPDATE, 
OP_INSERT_NODE, OP_DELETE_TEXT, OP_INSERT_TEXT, DATA_KEY } from '@editablejs/constants'
import type { IInput, IRange, IDrawRange, ISelection, ITyping, Position, SelectionOptions } from "./types";
import Layer from "./layer";
import type { ILayer } from "./layer"
import Range from './range'
import Input, { InputEventType } from "./input";
import Typing, { TypingEventType } from "./typing";

const SELECTION_BLUR_COLOR = 'rgba(136, 136, 136, 0.3)'
const SELECTION_FOCUS_COLOR = 'rgba(0,127,255,0.3)'
const SELECTION_CARET_COLOR = '#000'
const SELECTION_CARET_WIDTH = 2

export type SelectionEventType = typeof EVENT_VALUE_CHANGE | typeof EVENT_SELECTION_CHANGE | 
TypingEventType | InputEventType
export default class Selection extends EventEmitter<SelectionEventType> implements ISelection {
  
  protected options: SelectionOptions;
  protected ranges: IRange[] = [];
  protected start: Position | null = null;
  protected end: Position | null = null;
  protected layer: ILayer 
  protected input: IInput
  protected typing: ITyping
  protected model: IModel
  private blurColor: string
  private focusColor: string
  private caretColor: string
  private caretWidth: number
  private _isFoucs = false

  constructor(options: SelectionOptions) {
    super();
    this.options = options;
    const { blurColor, focusColor, caretColor, caretWidth, model } = options
    this.model = model
    //model.on(EVENT_NODE_UPDATE, this.handelNodeUpdate)
    model.on(EVENT_NODE_DID_UPDATE, this.handeleDidUpdate)
    this.blurColor = blurColor ?? SELECTION_BLUR_COLOR
    this.focusColor = focusColor ?? SELECTION_FOCUS_COLOR
    this.caretColor = caretColor ?? SELECTION_CARET_COLOR
    this.caretWidth = caretWidth ?? SELECTION_CARET_WIDTH
    this.typing = new Typing({
      model
    })
    this.bindTyping()
    this.layer = new Layer()
    this.input = new Input(this.layer)
    this.bindInput()
    this.on(EVENT_SELECTION_CHANGE, this.drawRanges)
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

  get isFocus(){
    return this._isFoucs
  }

  createRangeFromOps(ops: Op[]) { 
    const lastOp = ops[ops.length - 1]
    if(!lastOp) return
    const { type, key, offset, value } = lastOp
    if(!key) return
    switch(type) {
      case OP_INSERT_TEXT:
        if(offset === undefined) return
        return new Range({
          anchor: {
            key,
            offset: offset + value.length
          }
        })
      case OP_DELETE_TEXT:
        if(offset === undefined) return
        return new Range({
          anchor: {
            key,
            offset
          }
        })
      case OP_INSERT_NODE:

        break
    }
  }

  handelNodeUpdate = (node: INode, ops: Op[]) => { 
    const range = this.createRangeFromOps(ops)
    if(!range) return
    this.ranges = [range]
  }

  handeleDidUpdate = (node: INode, ops: Op[]) => {
    if(!node.getParent()) this.handleRootUpdate()
    const range = this.createRangeFromOps(ops)
    if(range) { 
      this.applyRange(range)
    }
  }

  handleRootUpdate = () => {
    const keys = this.model.getRootKeys()
    const domSelector = keys.map(key => `[${DATA_KEY}="${key}"]`).join(',')
    const containerList = keys.length > 0 ? document.querySelectorAll(domSelector) : []
    const containers: HTMLElement[] = Array.from(containerList) as HTMLElement[]
    this.typing.bindContainers(...containers)
    this.input.bindContainers(...containers)
  }

  bindTyping = () => {
    this.typing.on(EVENT_SELECT_START, (position: Position) => {
      this.removeAllRange()
      this.start = position
      this.emit(EVENT_SELECT_START, position)
    })
    const handleSelecting = (position?: Position) => { 
      if(!this.start || !position) return
      this.end = position
      const range = new Range({
        anchor: this.start,
        focus: position
      })
      this.removeAllRange()
      this.addRange(range)
      return range
    }
    this.typing.on(EVENT_SELECTING, (position?: Position) => {
      const range = handleSelecting(position)
      if(!range) return
      this.emit(EVENT_SELECTING, range)
    })
    this.typing.on(EVENT_SELECT_END, (position?: Position) => {
      const range = handleSelecting(position)
      if(!range) return
      this.emit(EVENT_SELECT_END, range)
    })
  }

  bindInput = () => {
    this.input.on(EVENT_CHANGE, (value: string) => {
      this.emit(EVENT_VALUE_CHANGE, value)
    })
    this.input.on(EVENT_BLUR, () => {
      this._isFoucs = false
      this.emit(EVENT_BLUR)
      this.emit(EVENT_SELECTION_CHANGE, ...this.ranges);
    })
    this.input.on(EVENT_FOCUS, () => {
      this._isFoucs = true
      this.emit(EVENT_FOCUS)
      this.emit(EVENT_SELECTION_CHANGE, ...this.ranges);
    })
    this.input.on(EVENT_KEYDOWN, (e: KeyboardEvent) => {
      this.emit(EVENT_KEYDOWN, e)
    })
    this.input.on(EVENT_KEYUP, (e: KeyboardEvent) => {
      this.emit(EVENT_KEYUP, e)
    })
  }
  
  getRangeAt = (index: number) => {
    return this.ranges.at(index) ?? null;
  }

  getRangeCount = (): number => {
    return this.ranges.length;
  }

  addRange = (range: IRange) => {
    this.ranges.push(range);
    this.emit(EVENT_SELECTION_CHANGE, ...this.ranges);
  }

  removeRangeAt = (index: number) => { 
    this.ranges.splice(index, 1);
    this.emit(EVENT_SELECTION_CHANGE, ...this.ranges);
  }

  removeAllRange = (): void => {
    const isEmit = this.ranges.length > 0
    this.ranges = [];
    if(isEmit) this.emit(EVENT_SELECTION_CHANGE, ...this.ranges);
  }

  applyRange = (range: IRange) => {
    const check = (key: NodeKey, offset: number) => {
      const node = this.model.getNode(key)
      if(!node) Log.nodeNotFound(key)
      if(Text.isText(node)) {
        const text = node.getText()
        if(offset < 0 || offset > text.length) Log.offsetOutOfRange(key, offset)
      } else if (Element.isElement(node)){
        const size = node.getChildrenSize()
        if(offset < 0 || offset > size) Log.offsetOutOfRange(key, offset)
      }
    }
    const { anchor, focus } = range
    check(anchor.key, anchor.offset)
    if(!range.isCollapsed) {
      check(focus.key, focus.offset)
    }
    this.removeAllRange()
    this.addRange(range)
  }

  drawRanges = (...ranges: IDrawRange[]) => {
    if(ranges.length === 0) {
      this.layer.clearSelection()
      return
    } else if(!this.isFocus && ranges.find(range => range.isCollapsed)) { 
      this.layer.clearCaret()
      return
    }
    ranges = ranges.map(range => {
      range.color = range.isCollapsed ? this.caretColor : (this.isFocus ? this.focusColor : this.blurColor)
      range.width = range.isCollapsed ? this.caretWidth : undefined
      return range
    })
    this.layer.draw(...ranges)
    this.input.render(ranges[ranges.length - 1])
  }

  moveTo(key: NodeKey, offset: number) {
    
  }

  destroy() { 
    this.typing.destroy()
    this.input.destroy()
    this.layer.destroy()
    this.removeAll()
  }
}

export {
  Range
}
export * from './types'