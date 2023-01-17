import { CursorRect } from '@editablejs/plugin-yjs-protocols/remote-cursors'
import { CaretPosition } from '../types'

export function getCaretPosition(
  selectionRects: CursorRect[],
  isBackward: boolean,
  isCollapsed: boolean,
): CaretPosition | null {
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
