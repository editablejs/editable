import { Editor, Node } from '../interfaces'
import { Grid } from '../interfaces'
import { WithEditorFirstArg } from '../utils'

export const getFragment: WithEditorFirstArg<
  Editor['getFragment']
> = editor => {
  const { selection } = editor
  if (!selection) {
    return []
  }
  const grid = Grid.above(editor)
  if (grid) {
    const sel = Grid.getSelection(editor, grid)
    const selected = Grid.getSelected(editor, grid, sel)
    if (selected) {
      const { colFull, rowFull, cols, rows } = selected
      if (colFull || rowFull || cols.length > 1 || rows.length > 1) {
        const fragment = Grid.getFragment(editor, grid, sel)
        return fragment ? [fragment] : []
      } else if (cols.length === 1 || rows.length === 1) {
        const cell = Grid.getCell(editor, grid, [rows[0], cols[0]])
        if (cell) {
          const { anchor, focus } = selection
          const [n, p] = cell
          return Node.fragment(n, {
            anchor: {
              path: anchor.path.slice(p.length),
              offset: anchor.offset,
            },
            focus: {
              path: focus.path.slice(p.length),
              offset: focus.offset,
            },
          })
        }
      }
    }
  }
  return Node.fragment(editor, selection)
}
