import * as React from 'react'
import { Editor, Element, Path } from 'slate'
import { useDragPosition, useDragTo, useDragType } from '../hooks/use-drag'
import { useEditableStatic } from '../hooks/use-editable'
import { useSelectionDrawingStyle } from '../hooks/use-selection-drawing'
import { GridCell } from '../interfaces/cell'
import { Editable } from '../plugin/editable'
import { SelectionDrawing } from '../plugin/selection-drawing'
import { ShadowRect } from './shadow'

export const DragCaretComponent = () => {
  const editor = useEditableStatic()
  const dragTo = useDragTo()
  const dragType = useDragType()
  const dragPosition = useDragPosition()
  const rects = React.useMemo(() => {
    if (!dragTo || !dragPosition) return null
    if (dragType === 'block') {
      const entry = Editor.above(editor, {
        at: dragTo.focus,
        match: n => Element.isElement(n),
        mode: 'lowest',
      })
      if (!entry) return null
      const element = Editable.toDOMNode(editor, entry[0])
      const rect = element.getBoundingClientRect()
      let { x, y } = rect
      const { height, width } = rect
      const { y: pY } = dragPosition
      const space = 1
      // bottom
      if (pY > y + height / 2) {
        y += height + space
      }
      // find previous sibling
      else {
        const previous = Editor.previous(editor, {
          at: entry[1],
          match: (n, p) => {
            if (!Element.isElement(n)) return false
            const gridCell = GridCell.find(editor, entry[1])
            if (!gridCell) return true
            const matchCell = GridCell.find(editor, p)
            if (!matchCell) return false

            return Path.equals(gridCell[1], matchCell[1])
          },
          mode: 'lowest',
        })
        if (previous) {
          const previousElement = Editable.toDOMNode(editor, previous[0])
          const previousRect = previousElement.getBoundingClientRect()
          y = previousRect.y + previousRect.height + space
        } else {
          y -= space
        }
      }
      const [rx, ry] = Editable.toRelativePosition(editor, x, y)
      return [new DOMRect(rx, ry, width, 2)]
    }
    return SelectionDrawing.getRects(editor, dragTo)
  }, [dragPosition, dragTo, dragType, editor])

  const { dragColor, caretWidth } = useSelectionDrawingStyle()
  if (!rects || rects.length === 0) return null
  if (dragType === 'block') {
    return (
      <ShadowRect
        rect={Object.assign({}, rects[0].toJSON(), {
          color: dragColor,
        })}
      />
    )
  }
  return (
    <ShadowRect
      rect={Object.assign({}, rects[0].toJSON(), {
        width: caretWidth,
        color: dragColor,
      })}
    />
  )
}
