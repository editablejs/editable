import { Editor } from '../interfaces/editor'
import { Transforms } from '../interfaces/transforms'
import { Range } from '../interfaces/range'
import { WithEditorFirstArg } from '../utils/types'
import { GridCell, List, Point, Element } from '@/interfaces'
import { getCurrentLineRange } from '@/layout'

export const deleteBackward: WithEditorFirstArg<Editor['deleteBackward']> = (
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
      const start = Editor.start(editor, cellPath)

      if (Point.equals(selection.anchor, start)) {
        return
      }
    }
    const list = List.above(editor)
    if (list && Editor.isStart(editor, selection.focus, list[1])) {
      List.unwrapList(editor)
      return
    }
  }
  if (unit !== 'line' && selection && Range.isCollapsed(selection)) {
    Transforms.delete(editor, { unit, reverse: true })
  }
  if (selection && Range.isCollapsed(selection)) {
    const parentBlockEntry = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      at: selection,
    })

    if (parentBlockEntry) {
      const [, parentBlockPath] = parentBlockEntry
      const parentElementRange = Editor.range(editor, parentBlockPath, selection.anchor)

      const currentLineRange = getCurrentLineRange(editor, parentElementRange)

      if (!Range.isCollapsed(currentLineRange)) {
        Transforms.delete(editor, { at: currentLineRange })
      }
    }
  }
}
