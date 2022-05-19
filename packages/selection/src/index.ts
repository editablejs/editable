import EventEmitter from "@editablejs/event-emitter";
import { Element, IModel, NodeKey, Text, INode, Op, IElement } from '@editablejs/model';
import { Log } from '@editablejs/utils'
import { EVENT_FOCUS, EVENT_BLUR, EVENT_CHANGE, EVENT_KEYDOWN, EVENT_KEYUP, EVENT_SELECT_START, EVENT_SELECT_END, EVENT_SELECTING, EVENT_VALUE_CHANGE, EVENT_SELECTION_CHANGE, 
OP_INSERT_NODE, OP_DELETE_TEXT, OP_INSERT_TEXT, DATA_KEY, EVENT_COMPOSITION_START, EVENT_COMPOSITION_END, EVENT_NODE_UPDATE } from '@editablejs/constants'
import type { DrawRect, IInput, IRange, ISelection, ITyping, Position, SelectionOptions } from "./types";
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
    model.on(EVENT_NODE_UPDATE, (_, ops) => this.silentUpdate(ops))
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
    this.on(EVENT_SELECTION_CHANGE, this.drawByRanges)
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
      this.ranges = []
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
    this.input.on(EVENT_COMPOSITION_START, ev => {
      this.emit(EVENT_COMPOSITION_START, ev)
    })
    this.input.on(EVENT_COMPOSITION_END, ev => {
      this.emit(EVENT_COMPOSITION_END, ev)
    })
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
    this.input.on(EVENT_KEYDOWN, ev => {
      this.emit(EVENT_KEYDOWN, ev)
    })
    this.input.on(EVENT_KEYUP, ev => {
      this.emit(EVENT_KEYUP, ev)
    })
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

  silentUpdate = (ops: Op[]) => { 
    const range = this.createRangeFromOps(ops)
    if(!range) return
    this.ranges = [range]
  }

  applyUpdate = (node: INode, ops: Op[]) => {
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

  getSubRanges = (...ranges: IRange[]): IRange[] => { 
    if(ranges.length === 0 && this.ranges.length === 0) return []
    if(ranges.length === 0) ranges = this.ranges
    const subRanges: IRange[] = []
    for(let i = 0; i < ranges.length; i++) {
      const range = ranges[i]
      if(range.isCollapsed) {
        subRanges.push(range)
        continue
      }
      const { anchor, focus } = range
      const start = this.model.getNode(anchor.key)
      const end = this.model.getNode(focus.key)
      if(!start || !end) continue
      let parentKey = start.getParent()
      if(!parentKey) continue;
      let parent = this.model.getNode<any, IElement>(parentKey)
      if(Text.isText(start)) {
        // same
        if(start.getKey() === end.getKey()) {
          subRanges.push(range)
          continue
        }
        subRanges.push(new Range({
          anchor: {
            key: anchor.key,
            offset: anchor.offset
          },
          focus: {
            key: anchor.key,
            offset: start.getText().length
          }
        }))
      }
      let next = this.model.getNext(anchor.key)
      let finded = false
      while(parent) {
        while(next) {
          const nextKey = next.getKey()
          if((Text.isText(next) && nextKey !== focus.key) || (Element.isElement(next) && !next.contains(focus.key))) {
            const offset = parent.indexOf(nextKey)
            if(offset === -1) continue
            subRanges.push(new Range({
              anchor: {
                key: parentKey,
                offset
              },
              focus: {
                key: parentKey,
                offset: offset + 1
              }
            }))
          }
          else if(Text.isText(next)) {
            subRanges.push(new Range({
              anchor: {
                key: focus.key,
                offset: 0
              },
              focus: {
                key: focus.key,
                offset: focus.offset
              }
            }))
            finded = true
            break
          } else if(Element.isElement(next)) {
            const findChildRange = (node: IElement) => {
              const children = node.getChildren()
              for(let i = 0; i < children.length; i++) {
                const child = children[i]
                const childKey = child.getKey()
                if(childKey === focus.key) {
                  subRanges.push(new Range({
                    anchor: {
                      key: childKey,
                      offset: 0
                    },
                    focus: {
                      key: childKey,
                      offset: focus.offset
                    }
                  }))
                  break
                } else if(Element.isElement(child) && child.contains(focus.key)) { 
                  findChildRange(child)
                  break
                }
                subRanges.push(new Range({
                  anchor: {
                    key: childKey,
                    offset: i
                  },
                  focus: {
                    key: childKey,
                    offset: i + 1
                  }
                }))
              }
            }
            findChildRange(next)
            finded = true
            break
          }
          next = this.model.getNext(next.getKey())
        }
        if(finded) break
        next = this.model.getNext(parentKey)
        parentKey = parent.getParent()
        if(!parentKey) break
        parent = this.model.getNode<any, IElement>(parentKey)
      }
    }
    return subRanges
  }

  getContents = (...ranges: IRange[]): INode[] => {
    const contents: INode[] = []
    const subRanges = this.getSubRanges(...ranges)
    subRanges.forEach(subRange => {
      if(!subRange.isCollapsed) {
        const { anchor, focus } = subRange
        const start = this.model.getNode(anchor.key)
        const end = this.model.getNode(focus.key)
        if(!start || !end) return
        if(Text.isText(start)) {
          const text = start.getText()
          start.setText(text.substring(anchor.offset, focus.offset))
          contents.push(start)
        } else if(Element.isElement(start)) {
          const children = start.getChildren()
          contents.push(children[anchor.offset])
        }
      }
    })
    return contents
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

  drawByRanges = (...ranges: IRange[]) => {
    if(ranges.length === 0) {
      this.clearSelection()
      return
    } else if(!this.isFocus && ranges.find(range => range.isCollapsed)) { 
      this.layer.clearCaret()
      return
    }
    this.clearSelection()
    const collapsedRange = ranges.find(r => r.isCollapsed)
    if(collapsedRange) {
      const rect = collapsedRange.getClientRects()?.item(0)
      if(rect) {
        this.drawCaretByRect(rect.toJSON())
      }
    } else {
      const color = this.isFocus ? this.focusColor : this.blurColor
      const rects: DrawRect[] = []
      ranges.forEach(range => {
        const rangeRects = range.getClientRects()
        if(rangeRects) {
          for(let i = 0; i < rangeRects.length; i++) {
            const rect = rangeRects.item(i)
            if(rect) rects.push(Object.assign({}, rect.toJSON(), { color }))
          }
        }
      })
      this.drawBlocksByRects(...rects)
    }
  }

  drawCaretByRect = (rect: Omit<DrawRect, 'color'> & Record<'color', string | undefined>): void => {
    this.layer.drawCaret({...rect, width: this.caretWidth, color: rect.color ?? this.caretColor})
    this.input.render(Object.assign({}, rect, { left: rect.left + rect.width,width: this.caretWidth }))
  }

  drawBlocksByRects = (...rects: (Omit<DrawRect, 'color'> & Record<'color', string | undefined>)[]) => {
    if(rects.length === 0) return
    const color = this.isFocus ? this.focusColor : this.blurColor
    this.layer.drawBlocks(...rects.map(rect => ({ ...rect, color: rect.color ?? color })))
    const rect = rects[rects.length - 1]
    this.input.render(Object.assign({}, rect, { left: rect.left + rect.width, width: this.caretWidth }))
  }

  clearSelection = () => { 
    this.layer.clearSelection()
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