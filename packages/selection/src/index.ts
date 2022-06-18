import EventEmitter from "@editablejs/event-emitter";
import { Element, IModel, NodeKey, Text, INode, Op, IElement, createNode } from '@editablejs/model';
import { Log } from '@editablejs/utils'
import { EVENT_FOCUS, EVENT_BLUR, EVENT_CHANGE, EVENT_KEYDOWN, EVENT_KEYUP, EVENT_SELECT_START, EVENT_SELECT_END, EVENT_SELECTING, EVENT_VALUE_CHANGE, EVENT_SELECTION_CHANGE, EVENT_COMPOSITION_START, EVENT_COMPOSITION_END, EVENT_NODE_UPDATE, EVENT_DOM_RENDER, EVENT_ROOT_DOM_RENDER, OP_DELETE_NODE } from '@editablejs/constants'
import type { DrawRect, IInput, IRange, ISelection, ITyping, Position, SelectionOptions } from "./types";
import Layer from "./layer";
import type { ILayer } from "./layer"
import Range from './range'
import Input, { InputEventType } from "./input";
import Typing, { TypingEventType } from "./typing";
import { assert, createRangefromOp, getPositionToBackward, getPositionToForward, isRendered } from "./utils";

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
  private _cacheApplyRange?: IRange 

  constructor(options: SelectionOptions) {
    super();
    this.options = options;
    const { blurColor, focusColor, caretColor, caretWidth, model } = options
    this.model = model
    model.on(EVENT_NODE_UPDATE, (_, ops) => this.applyFromOps(ops))
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
    const ranges = this.ranges
    if(ranges.length === 0) return true
    if(ranges.some(range => !range.isCollapsed)) return false
    const startRange = ranges[0];
    const endRange = ranges[this.ranges.length - 1];
    const { anchor: startAnchor } = startRange;
    const { anchor: endAnchor } = endRange
    return startAnchor.key === endAnchor.key && startAnchor.offset === endAnchor.offset
  }

  get isFocus(){
    return this._isFoucs
  }

  bindTyping = () => {
    const self = this
    const typing = self.typing
    const handleSelecting = (position?: Position) => { 
      if(!self.start || !position) return
      self.end = position
      const range = new Range({
        anchor: self.start,
        focus: position
      })
      const ranges = self.ranges
      if(ranges.length === 1 && ranges[0].equal(range)) return
      self.ranges = []
      self.addRange(range)
      return range
    }

    typing.on(EVENT_SELECT_START, (position: Position) => {
      self.start = position
      const range = handleSelecting(position)
      self.emit(EVENT_SELECT_START, position)
      if(!range) return
      self.emit(EVENT_SELECTING, range)
    })
   
    typing.on(EVENT_SELECTING, (position?: Position) => {
      const range = handleSelecting(position)
      if(!range) return
      self.emit(EVENT_SELECTING, range)
    })
    typing.on(EVENT_SELECT_END, (position?: Position) => {
      const range = handleSelecting(position)
      if(!range) return
      self.emit(EVENT_SELECT_END, range)
    })
    const applyCacheRange = () => {
      const range = self._cacheApplyRange
      if(range && isRendered(self.model, range)) {
        self.drawByRanges(range)
        self._cacheApplyRange = undefined
      }
    }
    typing.on(EVENT_DOM_RENDER, () => applyCacheRange())
    typing.on(EVENT_ROOT_DOM_RENDER, (containers: Map<string, HTMLElement>) => {
      self.input.updateContainers(containers)
      applyCacheRange()
      self.typing.stopMutationRoot()
    })
  }

  bindInput = () => {
    const self = this
    const input = self.input
    input.on(EVENT_COMPOSITION_START, ev => {
      self.emit(EVENT_COMPOSITION_START, ev)
    })
    input.on(EVENT_COMPOSITION_END, ev => {
      self.emit(EVENT_COMPOSITION_END, ev)
    })
    input.on(EVENT_CHANGE, (value: string) => {
      self.emit(EVENT_VALUE_CHANGE, value)
    })
    input.on(EVENT_BLUR, () => {
      if(!self._isFoucs) return
      self._isFoucs = false
      self.emit(EVENT_BLUR)
      self.drawByRanges(...self.ranges)
    })
    input.on(EVENT_FOCUS, () => {
      if(self._isFoucs) return
      self._isFoucs = true
      self.emit(EVENT_FOCUS)
      self.drawByRanges(...self.ranges)
    })
    input.on(EVENT_KEYDOWN, ev => {
      self.emit(EVENT_KEYDOWN, ev)
    })
    input.on(EVENT_KEYUP, ev => {
      self.emit(EVENT_KEYUP, ev)
    })
  }

  applyFromOps = (ops: Op[]) => { 
    const lastOp = ops[ops.length - 1]
    if(!lastOp) return
    const model = this.model
    const { offset } = lastOp
    if(ops.some(op => !op.key)) this.typing.startMutationRoot()
    let key = lastOp.key
    if(!key) {
      const roots = model.getRoots()
      const root = offset > roots.length ? roots[offset - 1] : roots[offset]
      if(root) key = root.getKey()
      else return
    }
    const node = model.getNode(key)
    if(!node) Log.nodeNotFound(key)
    const range = createRangefromOp(Object.assign({}, lastOp, { node }))
    if(!range) return
    const willDelete = () => {
      const keys = [range.anchor.key, range.focus.key]
      const checkNode = (node: INode) => {
        if(~keys.indexOf(node.getKey())) return true
        if(Element.isElement(node)) {
          const children = node.getChildren()
          for(let c = 0; c < children.length; c++) {
            const child = children[c]
            if(checkNode(child)) return true
          }
        }
        return false
      }
      for(let o = 0; o < ops.length; o++){
        const op = ops[o]
        if(op.type === OP_DELETE_NODE) {
          if(op.key && ~keys.indexOf(op.key)) return true
          const opNode = createNode(op.value)
          return checkNode(opNode)
        }
      }
      return false
    }
    if(willDelete()) {
      this._cacheApplyRange = range
      this.ranges = [range]
    } else {
      this.applyRange(range)
    }
  }

  /**
   * 按节点拆分子范围
   * @param ranges 
   * @returns 
   */
  getSubRanges = (...ranges: IRange[]): IRange[] => { 
    if(ranges.length === 0) {
      if(this.ranges.length === 0) return []
      ranges = this.ranges
    }
    const subRanges: IRange[] = []
    const model = this.model
    for(let i = 0; i < ranges.length; i++) {
      const range = ranges[i]
      // anchor 和 focus 同一个节点
      if(range.isCollapsed) {
        subRanges.push(range)
        continue
      }
      const { anchor, focus, isBackward } = range
      const startKey = isBackward ? focus.key : anchor.key
      const startOffset = isBackward ? focus.offset : anchor.offset
      // 开始节点
      const start = model.getNode(startKey)
      // 结束节点
      const endKey = isBackward ? anchor.key : focus.key
      const endOffset = isBackward ? anchor.offset : focus.offset
      const end = model.getNode(endKey)
      if(!start || !end) continue
      let parentKey = start.getParentKey()
      if(!parentKey) continue;
      let parent = model.getNode<any, IElement>(parentKey)
      if(Text.isText(start)) {
        // as same
        if(startKey === endKey) {
          subRanges.push(range)
          continue
        }
        subRanges.push(new Range({
          anchor: {
            key: startKey,
            offset: startOffset
          },
          focus: {
            key: startKey,
            offset: start.getText().length
          }
        }))
      }
      let next = model.getNext(startKey)
      let finded = false
     
      while(parent) {
        while(next) {
          const nextKey = next.getKey()
          if((Text.isText(next) && nextKey !== endKey) || (Element.isElement(next) && !next.contains(endKey))) {
            const offset = parent.indexOf(nextKey)
            if(!~offset) continue
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
                key: endKey,
                offset: 0
              },
              focus: {
                key: endKey,
                offset: endOffset
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
                if(childKey === endKey) {
                  subRanges.push(new Range({
                    anchor: {
                      key: childKey,
                      offset: 0
                    },
                    focus: {
                      key: childKey,
                      offset: endOffset
                    }
                  }))
                  break
                } else if(Element.isElement(child) && child.contains(endKey)) { 
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
          next = model.getNext(next.getKey())
        }
        if(finded) break
        next = model.getNext(parentKey)
        parentKey = parent.getParentKey()
        if(!parentKey) break
        parent = model.getNode<any, IElement>(parentKey)
      }
    }
    return subRanges
  }

  getContents = (...ranges: IRange[]): INode[] => {
    const model = this.model
    const subRanges = this.getSubRanges(...ranges)
    let parentElement: IElement | null = null
    for(let i = 0; i < subRanges.length; i++) { 
      const range = subRanges[i]
      const anchorNode = model.getNode(range.anchor.key)
      if(!anchorNode) continue
      const parentKey = anchorNode.getParentKey()
      if(!parentKey) continue
      if(!parentElement || !parentElement.contains(parentKey)) {
        const parent: IElement | null = model.getNode<any, IElement>(parentKey)
        if(parentElement && Text.isText(anchorNode) && parent?.getType() === parentElement.getType()) {
          const pKey: string | null = parentElement.getParentKey()
          parentElement = pKey ? model.getNode<any, IElement>(pKey) : null
        } else {
          parentElement = parent
        }
      }
    }
    const contents: INode[] = []
    const parentMap = new Map<string, IElement>()
    for(let s = 0; s < subRanges.length; s++) { 
      const range = subRanges[s]
      const { anchor, focus } = range
      const anchorNode = model.getNode(range.anchor.key)
      if(!anchorNode) continue
      let isAdd: boolean | undefined = undefined
      const warpParent = (child: INode) => {
        let parentKey = child.getParentKey()
        while(parentKey) {
          let parentClone = parentMap.get(parentKey)
          if(isAdd === undefined) isAdd = !parentClone
          if(!parentClone) {
            const parent = model.getNode<any, IElement>(parentKey)
            if(!parent || parentElement?.getType() === parent.getType()) return isAdd ? child : null
            parentClone = parent.clone()
            parentMap.set(parentKey, parentClone)
          } else if(parentClone.hasChild(child.getKey())) { 
            return null
          }
          parentClone.appendChild(child)
          child = parentClone
          parentKey = parentClone.getParentKey()
        }
        return child
      }
      if(Text.isText(anchorNode)) {
        const text = anchorNode.getText()
        anchorNode.setText(text.substring(anchor.offset, focus.offset))
        const newNode = warpParent(anchorNode)
        if(newNode) contents.push(newNode)
      } else if(Element.isElement(anchorNode)) {
        const children = anchorNode.getChildren()
        const newNode = warpParent(children[anchor.offset])
        if(newNode) contents.push(newNode)
      }
    }
    return contents
  }
  
  getRangeAt = (index: number) => {
    return this.ranges.at(index) ?? null;
  }

  getRangeCount = (): number => {
    return this.ranges.length;
  }

  addRange = (range: IRange) => {
    const self = this
    self.ranges.push(range);
    self.emit(EVENT_SELECTION_CHANGE, ...self.ranges);
  }

  removeRangeAt = (index: number) => { 
    const self = this
    self.ranges.splice(index, 1);
    self.emit(EVENT_SELECTION_CHANGE, ...self.ranges);
  }

  removeAllRange = (): void => {
    const self = this
    const isEmit = self.ranges.length > 0
    self.ranges = [];
    if(isEmit) self.emit(EVENT_SELECTION_CHANGE, ...self.ranges);
  }

  applyRange = (range: IRange) => {
    const self = this
    const model = self.model
    const checkNode = (key: NodeKey, offset: number) => {
      const node = model.getNode(key)
      if(!node) Log.nodeNotFound(key)
      assert(node, offset)
    }

    const { anchor, focus } = range
    checkNode(anchor.key, anchor.offset)
    if(!range.isCollapsed) {
      checkNode(focus.key, focus.offset)
    }
    if(!isRendered(model, range)) {
      self._cacheApplyRange = range
    } else {
      self._cacheApplyRange = undefined
    }
    const ranges = self.ranges
    if(ranges.length === 1 && ranges[0].equal(range)) return
    self.ranges = []
    self.addRange(range)
  }

  drawByRanges = (...ranges: IRange[]) => {
    const self = this
    if(ranges.length === 0) {
      self.clearSelection()
      return
    } else if(!self.isFocus && ranges.find(range => range.isCollapsed)) { 
      self.layer.clearCaret()
      return
    }
    self.clearSelection()
    const collapsedRange = ranges.find(r => r.isCollapsed)
    if(collapsedRange) {
      const rect = collapsedRange.getClientRects()?.item(0)
      if(rect) {
        self.drawCaretByRect(rect.toJSON())
      }
    } else {
      const color = self.isFocus ? self.focusColor : self.blurColor
      const rects: DrawRect[] = []
      ranges.forEach(range => {
        const subRects = range.getClientRects()
        if(subRects) {
          const indexs: number[] = []
          const findSameLocation = (x: number, y: number, index: number) => { 
            for(let r = 0; r < subRects.length; r++) {
              if(~indexs.indexOf(r)) continue
              const rect = subRects[r]
              if(rect.x === x && rect.y === y && r !== index) return rect
            }
            return null
          }
          for(let i = 0; i < subRects.length; i++) {
            const rect = subRects.item(i)
            if(rect) {
              const sameLocation = findSameLocation(rect.x, rect.y, i)
              if(sameLocation && rect.width >= sameLocation.width) {
                indexs.push(i)
                continue
              }
              rects.push(Object.assign({}, rect.toJSON(), { color }))
            }
          }
        }
      })
      self.drawBlocksByRects(...rects)
    }
  }

  drawCaretByRect = (rect: Omit<DrawRect, 'color'> & Record<'color', string | undefined>): void => {
    const self = this
    self.layer.drawCaret({...rect, width: self.caretWidth, color: rect.color ?? self.caretColor})
    self.input.render(Object.assign({}, rect, { left: rect.left + rect.width,width: self.caretWidth }))
  }

  drawBlocksByRects = (...rects: (Omit<DrawRect, 'color'> & Record<'color', string | undefined>)[]) => {
    if(rects.length === 0) return
    const self = this
    const color = this.isFocus ? self.focusColor : self.blurColor
    self.layer.drawBlocks(...rects.map(rect => ({ ...rect, color: rect.color ?? color })))
    const rect = rects[rects.length - 1]
    self.input.render(Object.assign({}, rect, { left: rect.left + rect.width, width: self.caretWidth }))
  }

  clearSelection = () => { 
    this.layer.clearSelection()
  }

  moveTo(key: NodeKey, offset: number) {
    const self = this
    const range = Range.create({
      anchor: { key, offset },
      focus: { key, offset }
    })
    self.applyRange(range)
    return self
  }

  moveAnchorTo(key: NodeKey, offset: number) {
    const self = this
    const currentRange = self.getRangeAt(0)
    const range = Range.create({
      anchor: { key, offset },
      focus: currentRange ? { ...currentRange.focus } : { key, offset }
    })
    self.applyRange(range)
    return self
  }

  moveFocusTo(key: NodeKey, offset: number) {
    const self = this
    const currentRange = self.getRangeAt(0)
    const range = Range.create({
      focus: { key, offset },
      anchor: currentRange ? { ...currentRange.anchor } : { key, offset }
    })
    self.applyRange(range)
    return self
  }

  moveToForward(){ 
    const self = this
    const range = self.getRangeAt(0)
    if(!range) return self
    const { focus } = range
    const { anchor } = range
    const focusKey = focus.key
    const focusOffset = focus.offset
    const anchorKey = anchor.key
    const anchorOffset = anchor.offset
    if(range.isCollapsed) {
      const { key, offset } = getPositionToForward(self.model, focusKey, focusOffset)
      return self.moveTo(key, offset)
    } else if(range.isBackward) {
      return self.moveFocusTo(anchorKey, anchorOffset)
    } else {
      return self.moveAnchorTo(focusKey, focusOffset)
    }
  }

  moveToBackward(){ 
    const self = this
    const range = self.getRangeAt(0)
    if(!range) return self
    const { focus } = range
    const { anchor } = range
    const focusKey = focus.key
    const focusOffset = focus.offset
    const anchorKey = anchor.key
    const anchorOffset = anchor.offset
    if(range.isCollapsed) {
      const { key, offset } = getPositionToBackward(self.model, focusKey, focusOffset)
      return self.moveTo(key, offset)
    } else if(range.isBackward) {
      return self.moveAnchorTo(focusKey, focusOffset)
    } else {
      return self.moveFocusTo(anchorKey, anchorOffset)
    }
  }

  moveAnchorToForward(){ 
    const self = this
    const range = self.getRangeAt(0)
    if(!range) return self
    const { anchor } = range
    const { key, offset } = getPositionToForward(self.model, anchor.key, anchor.offset)
    return self.moveAnchorTo(key, offset)
  }

  moveFocusToForward(){ 
    const self = this
    const range = self.getRangeAt(0)
    if(!range) return self
    const { focus } = range
    const { key, offset } = getPositionToForward(self.model, focus.key, focus.offset)
    return self.moveFocusTo(key, offset)
  }

  moveAnchorToBackward(){ 
    const self = this
    const range = self.getRangeAt(0)
    if(!range) return self
    const { anchor } = range
    const { key, offset } = getPositionToBackward(self.model, anchor.key, anchor.offset)
    return self.moveAnchorTo(key, offset)
  }

  moveFocusToBackward(){ 
    const self = this
    const range = self.getRangeAt(0)
    if(!range) return self
    const { focus } = range
    const { key, offset } = getPositionToBackward(self.model, focus.key, focus.offset)
    return self.moveFocusTo(key, offset)
  }

  destroy() { 
    const self = this
    self.typing.destroy()
    self.input.destroy()
    self.layer.destroy()
    self.removeAll()
  }
}

export {
  Range
}
export * from './types'