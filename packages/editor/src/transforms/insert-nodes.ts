import { Editor, NodeMatch, Transforms, Node, Location } from 'slate'
import { RangeMode } from 'slate/dist/interfaces/types'
import { Editable } from '../plugin/editable'
import { handleInsertOnGrid } from './utils'

const { insertNodes: defaultInsertNodes } = Transforms

export const insertNodes = <T extends Node>(
  editor: Editor,
  nodes: Node | Node[],
  options: {
    at?: Location
    match?: NodeMatch<T>
    mode?: RangeMode
    hanging?: boolean
    select?: boolean
    voids?: boolean
  } = {},
) => {
  const { at = editor.selection } = options
  if (Editable.isEditor(editor) && handleInsertOnGrid(editor, at)) {
    defaultInsertNodes(editor, nodes, options)
  }
}
