import * as React from 'react'
import { Path, Grid, GridSelection } from '@editablejs/models'
import { Editable } from '../plugin/editable'
import { useEditableStatic } from './use-editable'
import { useGrid } from './use-grid'
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'
import { useNodeFocused } from './use-node-focused'

const useGridSelection = () => {
  const editor = useEditableStatic()
  const grid = useGrid()
  // selection
  const [selection, setSelection] = React.useState<GridSelection | null>(null)
  const nodeFocused = useNodeFocused()

  useIsomorphicLayoutEffect(() => {
    if (grid && nodeFocused) {
      const selection = Grid.getSelection(editor, [grid, Editable.findPath(editor, grid)])
      if (selection) {
        setSelection(prev => {
          if (
            !prev ||
            !Path.equals(prev.start, selection.start) ||
            !Path.equals(prev.end, selection.end)
          ) {
            const path = Editable.findPath(editor, grid)
            const startPath = path.concat(selection.start)
            const endPath = path.concat(selection.end)
            const edgeSelection = Grid.edges(editor, [grid, path], selection)
            const { start: tableStart, end: tableEnd } = Grid.span(
              editor,
              [grid, path],
              edgeSelection,
            )
            const selStart = path.concat(tableStart)
            const selEnd = path.concat(tableEnd)
            // 有合并的单元格时选择区域会变大，所以需要重新select
            if (!Path.equals(startPath, selStart) || !Path.equals(endPath, selEnd)) {
              Grid.select(editor, [grid, path], edgeSelection)
              return prev
            }
            return selection
          }
          return prev
        })
        return
      }
    }
    setSelection(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, editor.selection, nodeFocused])

  return selection
}

export { useGridSelection }
