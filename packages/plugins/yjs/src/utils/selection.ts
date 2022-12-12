import { BaseRange, Range } from '@editablejs/editor'

export type SelectionRect = {
  width: number
  height: number
  top: number
  left: number
}

export type CaretPosition = {
  height: number
  top: number
  left: number
}

export function getCaretPosition(
  selectionRects: SelectionRect[],
  range: BaseRange,
): CaretPosition | null {
  const isCollapsed = range && Range.isCollapsed(range)
  const isBackward = range && Range.isBackward(range)
  const anchorRect = selectionRects[isBackward ? 0 : selectionRects.length - 1]

  if (!anchorRect) {
    return null
  }

  return {
    height: anchorRect.height,
    top: anchorRect.top,
    left: anchorRect.left + (isBackward || isCollapsed ? 0 : anchorRect.width),
  }
}
