import { Editable, useEditableStatic, useLocaleFormat } from '@editablejs/editor'
import { TableDrag, useTableDragCount, useTableDragPoint } from '../hooks/use-drag'
import { TableLocale } from '../locale'

export const Dragging = () => {
  const editor = useEditableStatic()
  const point = useTableDragPoint()
  const count = useTableDragCount()
  const { format } = useLocaleFormat<TableLocale>('table')

  if (!point) return null
  const [x, y] = Editable.toRelativePosition(editor, point.x, point.y)
  return (
    <div
      tw="absolute left-0 top-0 pointer-events-none py-2 px-4 bg-blue-500 text-white opacity-80 z-10"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <div tw="text-center text-sm">
        {format(TableDrag.getDragType() === 'col' ? 'moveCols' : 'moveRows', { count })}
      </div>
    </div>
  )
}
