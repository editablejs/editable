import {
  Editable,
  useGridSelectionRect,
  Grid,
  useEditableStatic,
  useIsomorphicLayoutEffect,
} from '@editablejs/editor'
import React from 'react'
import { SelectionStyles } from './styles'

export interface TableSelectionProps {
  editor: Editable
  table: Grid
}

const TableSelection: React.FC<TableSelectionProps> = () => {
  const editor = useEditableStatic()
  const rect = useGridSelectionRect()

  useIsomorphicLayoutEffect(() => {
    if (rect) {
      editor.pauseSelectionDrawing()
    } else {
      editor.enableSelectionDrawing()
    }

    return () => {
      editor.enableSelectionDrawing()
    }
  }, [editor, rect])

  if (!rect) return null
  const { top, left, width, height } = rect
  return <SelectionStyles style={{ left, top, width, height }} />
}

export { TableSelection }
