import * as React from 'react'
import { GridCell, Grid } from '@editablejs/models'
import { Editable } from '../plugin/editable'
import { useEditableStatic } from './use-editable'
import { useGrid } from './use-grid'
import { useGridSelection } from './use-grid-selection'
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'

const useGridSelectionRect = () => {
  const editor = useEditableStatic()

  const grid = useGrid()

  const selection = useGridSelection()

  const [rect, setRect] = React.useState<DOMRect | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (!selection || !grid) return setRect(null)
    const { start, end } = GridCell.edges(selection)
    if (GridCell.equal(start, end)) return setRect(null)
    const path = Editable.findPath(editor, grid)
    const startCell = Grid.getCell(editor, path, start)
    if (!startCell) return setRect(null)
    const endCell = Grid.getCell(editor, path, end)
    if (!endCell) return setRect(null)
    const startEl = Editable.toDOMNode(editor, startCell[0])
    const endEl = Editable.toDOMNode(editor, endCell[0])
    const tableEl = Editable.toDOMNode(editor, grid)
    const tableRect = tableEl.getBoundingClientRect()
    const startRect = startEl.getBoundingClientRect()
    const endRect = endEl.getBoundingClientRect()
    const width =
      endRect.left < startRect.left
        ? startRect.right - endRect.left
        : endRect.right - startRect.left
    const height = Math.max(endRect.bottom - startRect.top, startRect.height)
    const top = startRect.top - tableRect.top
    const left = Math.min(startRect.left - tableRect.left, endRect.left - tableRect.left)
    setRect(new DOMRect(left, top, width, height))
  }, [editor, selection, grid])

  return rect
}

export { useGridSelectionRect }
