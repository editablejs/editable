import {
  Editable,
  useGridSelectionRect,
  useEditableStatic,
  useIsomorphicLayoutEffect,
  SelectionDrawing,
} from '@editablejs/editor'
import { Editor, Grid } from '@editablejs/models'
import * as React from 'react'
import { SelectionStyles } from './styles'

export interface TableSelectionProps {
  editor: Editor
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
