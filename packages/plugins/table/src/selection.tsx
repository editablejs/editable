import {
  Editable,
  useGridSelectionRect,
  Grid,
  useEditableStatic,
  useIsomorphicLayoutEffect,
  SelectionDrawing,
} from '@editablejs/editor'
import * as React from 'react'
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
      SelectionDrawing.setEnabled(editor, false)
    } else {
      SelectionDrawing.setEnabled(editor, true)
    }

    return () => {
      SelectionDrawing.setEnabled(editor, true)
    }
  }, [editor, rect])

  if (!rect) return null
  const { top, left, width, height } = rect
  return <SelectionStyles style={{ left, top, width, height }} />
}

export { TableSelection }
