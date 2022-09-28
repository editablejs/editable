import { BaseRange, Editable, Editor, Path, Range, Text } from '@editablejs/editor'

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

export function getSelectionRects(
  editor: Editable,
  range: BaseRange,
  xOffset: number,
  yOffset: number,
): SelectionRect[] {
  const [start, end] = Range.edges(range)
  const domRange = Editable.toDOMRange(editor, range)

  const selectionRects: SelectionRect[] = []
  const nodeIterator = Editor.nodes(editor, { at: range, match: Text.isText })

  for (const [node, path] of nodeIterator) {
    const domNode = Editable.toDOMNode(editor, node)

    const isStartNode = Path.equals(path, start.path)
    const isEndNode = Path.equals(path, end.path)

    let clientRects: DOMRectList | null = null
    if (isStartNode || isEndNode) {
      const nodeRange = document.createRange()
      nodeRange.selectNode(domNode)

      if (isStartNode) {
        nodeRange.setStart(domRange.startContainer, domRange.startOffset)
      }
      if (isEndNode) {
        nodeRange.setEnd(domRange.endContainer, domRange.endOffset)
      }

      clientRects = nodeRange.getClientRects()
    } else {
      clientRects = domNode.getClientRects()
    }

    for (let i = 0; i < clientRects.length; i++) {
      const clientRect = clientRects.item(i)
      if (!clientRect) {
        continue
      }

      selectionRects.push({
        width: clientRect.width,
        height: clientRect.height,
        top: clientRect.top - yOffset,
        left: clientRect.left - xOffset,
      })
    }
  }

  return selectionRects
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
