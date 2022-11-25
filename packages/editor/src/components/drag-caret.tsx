import { useMemo } from 'react'
import { useDragTo } from '../hooks/use-drag'
import { useEditableStatic } from '../hooks/use-editable-static'
import { useSelectionDrawingStyle } from '../hooks/use-selection-drawing'
import { Editable } from '../plugin/editable'
import { ShadowRect } from './shadow'

export const DragCaretComponent = () => {
  const editor = useEditableStatic()
  const dragTo = useDragTo()
  const rects = useMemo(
    () => (dragTo ? Editable.getSelectionRects(editor, dragTo) : null),
    [dragTo, editor],
  )

  const style = useSelectionDrawingStyle()
  if (!rects || rects.length === 0) return null

  return (
    <ShadowRect
      rect={Object.assign({}, rects[0].toJSON(), {
        width: style.caretWidth,
        color: style.dragColor,
      })}
      style={{ willChange: 'transform' }}
    />
  )
}
