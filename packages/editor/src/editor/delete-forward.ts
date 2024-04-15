import { Editor } from '../interfaces/editor'
import { Transforms } from '../interfaces/transforms'
import { Range } from '../interfaces/range'
import { WithEditorFirstArg } from '../utils/types'
import { GridCell, Point } from '@/interfaces'

export const deleteForward: WithEditorFirstArg<Editor['deleteForward']> = (
  editor,
  unit
) => {
  const { selection } = editor
  if (selection && Range.isCollapsed(selection)) {
    const [cell] = Editor.nodes(editor, {
      match: n => GridCell.isGridCell(n),
    })

    if (cell) {
      const [, cellPath] = cell
      const end = Editor.end(editor, cellPath)
      if (Point.equals(selection.anchor, end)) {
        return
      }
    }
  }
  if (selection && Range.isCollapsed(selection)) {
    Transforms.delete(editor, { unit })
  }
}
