import * as React from 'react'
import { GridSelected, Grid } from '@editablejs/models'
import { Editable } from '../plugin/editable'
import { useEditableStatic } from './use-editable'
import { useGrid } from './use-grid'
import { useGridSelection } from './use-grid-selection'

const defaultSelected = {
  rows: [],
  cols: [],
  rowFull: false,
  colFull: false,
  allFull: false,
  cells: [],
  count: 0,
}

const useGridSelected = () => {
  const editor = useEditableStatic()

  const grid = useGrid()

  const selection = useGridSelection()

  const selected: GridSelected = React.useMemo(() => {
    if (!grid) return defaultSelected
    const sel = Grid.getSelected(editor, Editable.findPath(editor, grid), selection ?? undefined)
    return sel ?? defaultSelected
  }, [editor, selection, grid])

  return selected
}

export { useGridSelected }
