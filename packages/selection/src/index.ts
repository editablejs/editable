import { Element, ModelInterface, NodeKey, NodeInterface, Op, createNode } from '@editablejs/model';
import { Log } from '@editablejs/utils'
import type { SelectionInterface } from "./types";
import Range, { RangeInterface } from './range'
import { isFocus } from "./input";
import { createTyping } from "./typing";
import { assert, createRangefromOp, getPositionToBackward, getPositionToForward, isRendered } from "./utils";
import { getSubRanges } from "./sub-ranges";
import { getContents } from "./contents";
import { addRanges, celarChacheRange, clearRanges, getCacheRange, getRangeCount, getRanges, hasCacheRange, resetRanges, setCacheRange } from "./range-weakmap";
import { drawByRanges, getInputLayer } from "./draw";
import { OP_DELETE_NODE } from '@editablejs/constants';

export const createSelection = (model: ModelInterface) => {

  const selection: SelectionInterface = {
    get anchor() {
      return this.getRangeAt(0)?.anchor ?? null;
    },
  
    get focus() { 
      const ranges = getRanges(selection)
      return this.getRangeAt(ranges.length - 1)?.focus ?? null;
    },
  
    get isCollapsed() {
      const ranges = getRanges(selection)
      if(ranges.length === 0) return true
      if(ranges.some(range => !range.isCollapsed)) return false
      const startRange = ranges[0];
      const endRange = ranges[ranges.length - 1];
      const { anchor: startAnchor } = startRange;
      const { anchor: endAnchor } = endRange
      return startAnchor.key === endAnchor.key && startAnchor.offset === endAnchor.offset
    },
  
    get isFocus(){
      return isFocus(selection)
    },

    onKeydown(event: KeyboardEvent){},

    onKeyup(event: KeyboardEvent){},

    onCompositionStart(event: CompositionEvent){},

    onCompositionEnd(event: CompositionEvent){},

    onInput(event: InputEvent){},

    onFocus(){
      drawByRanges(selection, ...getRanges(selection))
    },

    onBlur(){
      drawByRanges(selection, ...getRanges(selection))
    },

    onSelectStart(){},

    onSelecting(){},

    onSelectEnd(){},

    onSelectChange(){
      if(hasCacheRange(selection)) return
      drawByRanges(selection, ...getRanges(selection))
    },

    getRangeAt(index: number){
      return getRanges(selection)?.at(index) ?? null;
    },
  
    getRangeCount(): number {
      return getRangeCount(selection);
    },
  
    addRange(range: RangeInterface){
      addRanges(selection, range)
      selection.onSelectChange()
    },
  
    removeRangeAt(index: number){ 
      const ranges = getRanges(selection)
      if(!ranges || ranges.length === 0) return
      ranges.splice(index, 1);
      selection.onSelectChange()
    },
  
    removeAllRange(){
      if(selection.getRangeCount() > 0) {
        clearRanges(selection)
        selection.onSelectChange()
      }
    },
  
    applyRange(range: RangeInterface){
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
        setCacheRange(selection, range)
      } else {
        celarChacheRange(selection)
      }
      const ranges = getRanges(selection)
      if(!ranges || ranges.length !== 1 || !ranges[0].equal(range)) {
        resetRanges(selection, range)
        selection.onSelectChange()
      }
    },

    applyOps(ops: Op[]){ 
      const lastOp = ops[ops.length - 1]
      if(!lastOp) return
      const { offset } = lastOp
      if(ops.some(op => !op.key)) typing.startMutation()
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
        const checkNode = (node: NodeInterface) => {
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
        setCacheRange(selection, range)
        resetRanges(selection, range)
      } else {
        this.applyRange(range)
      }
    },

    moveTo(key: NodeKey, offset: number) {
      const range = new Range(key, offset)
      selection.applyRange(range)
      return selection
    },
  
    moveAnchorTo(key: NodeKey, offset: number) {
      const currentRange = selection.getRangeAt(0)
      const range = currentRange ? new Range(key, offset, currentRange.focus.key, currentRange.focus.offset) : new Range(key, offset)
      selection.applyRange(range)
      return selection
    },
  
    moveFocusTo(key: NodeKey, offset: number) {
      const currentRange = selection.getRangeAt(0)
      const range = currentRange ? new Range(currentRange.anchor.key, currentRange.anchor.offset, key, offset) : new Range(key, offset)
      selection.applyRange(range)
      return selection
    },
  
    moveToForward(){ 
      const range = selection.getRangeAt(0)
      if(!range) return selection
      const { focus } = range
      const { anchor } = range
      const focusKey = focus.key
      const focusOffset = focus.offset
      const anchorKey = anchor.key
      const anchorOffset = anchor.offset
      if(range.isCollapsed) {
        const { key, offset } = getPositionToForward(model, focusKey, focusOffset)
        return selection.moveTo(key, offset)
      } else if(range.isBackward) {
        return selection.moveFocusTo(anchorKey, anchorOffset)
      } else {
        return selection.moveAnchorTo(focusKey, focusOffset)
      }
    },
  
    moveToBackward(){ 
      const range = selection.getRangeAt(0)
      if(!range) return selection
      const { focus } = range
      const { anchor } = range
      const focusKey = focus.key
      const focusOffset = focus.offset
      const anchorKey = anchor.key
      const anchorOffset = anchor.offset
      if(range.isCollapsed) {
        const { key, offset } = getPositionToBackward(model, focusKey, focusOffset)
        return selection.moveTo(key, offset)
      } else if(range.isBackward) {
        return selection.moveAnchorTo(focusKey, focusOffset)
      } else {
        return selection.moveFocusTo(anchorKey, anchorOffset)
      }
    },
  
    moveAnchorToForward(){ 
      const range = selection.getRangeAt(0)
      if(!range) return selection
      const { anchor } = range
      const { key, offset } = getPositionToForward(model, anchor.key, anchor.offset)
      return selection.moveAnchorTo(key, offset)
    },
  
    moveFocusToForward(){ 
      const range = selection.getRangeAt(0)
      if(!range) return selection
      const { focus } = range
      const { key, offset } = getPositionToForward(model, focus.key, focus.offset)
      return selection.moveFocusTo(key, offset)
    },
  
    moveAnchorToBackward(){ 
      const range = selection.getRangeAt(0)
      if(!range) return selection
      const { anchor } = range
      const { key, offset } = getPositionToBackward(model, anchor.key, anchor.offset)
      return selection.moveAnchorTo(key, offset)
    },
  
    moveFocusToBackward(){ 
      const range = selection.getRangeAt(0)
      if(!range) return selection
      const { focus } = range
      const { key, offset } = getPositionToBackward(model, focus.key, focus.offset)
      return selection.moveFocusTo(key, offset)
    },
    /**
     * 按节点拆分子范围
     * @param ranges 
     * @returns 
     */
    getSubRanges(...ranges: RangeInterface[]) { 
      if(ranges.length === 0) {
        const currentRanges = getRanges(selection)
        if(!currentRanges || currentRanges.length === 0) return []
        ranges = currentRanges
      }
      return getSubRanges(model, ...ranges)
    },

    getContents(...ranges: RangeInterface[]) { 
      if(ranges.length === 0) {
        const currentRanges = getRanges(selection)
        if(!currentRanges || currentRanges.length === 0) return []
        ranges = currentRanges
      }
      return getContents(model, ...ranges)
    }
  }
  
  const applyCacheRange = () => {
    const range = getCacheRange(selection)
    if(range && isRendered(model, range)) {
      drawByRanges(selection, range)
      celarChacheRange(selection)
    } else {
      drawByRanges(selection, ...getRanges(selection))
    }
  }

  const typing = createTyping(selection, model)

  typing.onContainerRendered = () => applyCacheRange()

  typing.onRootRendered = (containers) => { 
    getInputLayer(selection)?.updateContainers(containers)
    applyCacheRange()
    typing.stopMutation()
  }
  

  return selection
}

export {
  Range, 
};
export type { RangeInterface, SelectionInterface };