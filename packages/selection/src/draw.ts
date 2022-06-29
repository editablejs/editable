import { createInput, InputInterface, INPUT_BOX_STYLE } from "./input";
import { createLayer, DrawRect, LayerInterface } from "./layer"
import { RangeInterface } from "./range"
import { SelectionInterface } from "./types"

const LAYER_TO_SELECTOIN_WEAK_MAP = new WeakMap<SelectionInterface, LayerInterface>();

export interface SelectionDrawStyle {
  focusBgColor?: string
  blurBgColor?: string
  caretColor?: string
  caretWidth?: number
}

const SELECTION_BLUR_COLOR = 'rgba(136, 136, 136, 0.3)'
const SELECTION_FOCUS_COLOR = 'rgba(0,127,255,0.3)'
const SELECTION_CARET_COLOR = '#000'
const SELECTION_CARET_WIDTH = 2

const SELECTION_DRAW_OPTIONS_WEAKMAP = new WeakMap<SelectionInterface, SelectionDrawStyle>()

export const getDrawStyle = (selection: SelectionInterface): Required<SelectionDrawStyle> => { 
  const style = SELECTION_DRAW_OPTIONS_WEAKMAP.get(selection) || {}
  style.blurBgColor = style.blurBgColor ?? SELECTION_BLUR_COLOR
  style.focusBgColor = style.focusBgColor ?? SELECTION_FOCUS_COLOR
  style.caretColor = style.caretColor ?? SELECTION_CARET_COLOR
  style.caretWidth = style.caretWidth ?? SELECTION_CARET_WIDTH
  SELECTION_DRAW_OPTIONS_WEAKMAP.set(selection, style)
  return style as Required<SelectionDrawStyle>
}

export const setDrawStyle = (selection: SelectionInterface, drawStyle: SelectionDrawStyle) => { 
  SELECTION_DRAW_OPTIONS_WEAKMAP.set(selection, drawStyle)
}

export const getLayer = (selection: SelectionInterface) => {
  if(LAYER_TO_SELECTOIN_WEAK_MAP.has(selection)) return LAYER_TO_SELECTOIN_WEAK_MAP.get(selection)!
  const layer = createLayer()
  LAYER_TO_SELECTOIN_WEAK_MAP.set(selection, layer)
  return layer
}

export const drawByRanges = (selection: SelectionInterface, ...ranges: RangeInterface[]) => {
  const layer = getLayer(selection)

  if(ranges.length === 0) {
    layer.clearSelection()
    return
  } else if(!selection.isFocus && ranges.find(range => range.isCollapsed)) { 
    layer.clearCaret()
    return
  }
  const collapsedRange = ranges.find(r => r.isCollapsed)
  const drawStyle = getDrawStyle(selection)
  layer.clearSelection()
  if(collapsedRange) {
    const rect = collapsedRange.getClientRects()?.item(0)
    if(rect) {
      drawCaretByRect(selection, rect.toJSON())
    }
  } else {
    const color = selection.isFocus ? drawStyle.focusBgColor : drawStyle.blurBgColor
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
    drawBlocksByRects(selection, ...rects)
  }
}

export const drawCaretByRect = (selection: SelectionInterface, rect: Omit<DrawRect, 'color'> & Record<'color', string | undefined>): void => {
  const layer = getLayer(selection)
  const drawStyle = getDrawStyle(selection)
  layer.drawCaret({...rect, width: drawStyle.caretWidth, color: rect.color ?? drawStyle.caretColor})
  drawInput(selection, Object.assign({}, rect, { left: rect.left + rect.width, width: drawStyle.caretWidth }))
}

export const drawBlocksByRects = (selection: SelectionInterface, ...rects: (Omit<DrawRect, 'color'> & Record<'color', string | undefined>)[]) => {
  const layer = getLayer(selection)
  const drawStyle = getDrawStyle(selection)
  if(rects.length === 0) return
  const color = selection.isFocus ? drawStyle.focusBgColor : drawStyle.blurBgColor
  layer.drawBlocks(...rects.map(rect => Object.assign({}, rect, { color: rect.color ?? color })))
  const rect = rects[rects.length - 1]
  drawInput(selection, Object.assign({}, rect, { left: rect.left + rect.width, width: drawStyle.caretWidth }))
}

const INPUT_TO_SELECTOIN_WEAK_MAP = new WeakMap<SelectionInterface, InputInterface>();
const BOX_TO_INPUT_WEAK_MAP = new WeakMap<InputInterface, HTMLDivElement>();

export const getInputLayer = (selection: SelectionInterface) => { 
  let input = INPUT_TO_SELECTOIN_WEAK_MAP.get(selection)
  if(input) return input
  input = createInput(selection)
  const layer = getLayer(selection)
  const box = layer.createBox('input', { top: 0, left: 0, width: 0, height: 0 }, INPUT_BOX_STYLE)
  box.appendChild(input.getTextarea())
  layer.appendChild(box)
  INPUT_TO_SELECTOIN_WEAK_MAP.set(selection, input)
  return input
}

export const drawInput = (selection: SelectionInterface, rect: Omit<DrawRect, 'color'>) => {
  const input = getInputLayer(selection)
  const box = BOX_TO_INPUT_WEAK_MAP.get(input)
  if(!box) return
  const layer = getLayer(selection)
  layer.updateBox(box, Object.assign({}, rect, { color: 'transparent', width: 1 }), INPUT_BOX_STYLE)
}