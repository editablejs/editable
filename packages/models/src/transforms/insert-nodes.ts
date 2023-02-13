import { NodeMatch, Transforms, Node, Location, Element, Path, PathRef } from 'slate'
import { RangeMode } from 'slate/dist/interfaces/types'
import { Editor } from '../interfaces/editor'
import { handleInserInGrid } from './utils'

const { insertNodes: defaultInsertNodes } = Transforms

const FLUSHING = new WeakMap<Editor, boolean>()
const LAST_NODE = new WeakMap<Editor, Node>()
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
  if (handleInserInGrid(editor, at)) {
    // 插入 grid 或者 void block 时，
    const firstNode = Array.isArray(nodes) ? nodes[0] : nodes
    let pathRef: PathRef | undefined
    if (
      !options.match &&
      Element.isElement(firstNode) &&
      (editor.isGrid(firstNode) || (editor.isVoid(firstNode) && Editor.isBlock(editor, firstNode)))
    ) {
      const block = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
      })
      if (at && block && Editor.isEmpty(editor, block[0])) {
        pathRef = Editor.pathRef(editor, block[1])
      }
    }
    defaultInsertNodes(editor, nodes, options)
    if (pathRef) {
      const path = pathRef.unref()
      if (path) {
        Transforms.removeNodes(editor, {
          at: path,
        })
      }
    }
  }
  const lastNode = Array.isArray(nodes) ? nodes[nodes.length - 1] : nodes
  LAST_NODE.set(editor, lastNode)
  if (!FLUSHING.get(editor)) {
    FLUSHING.set(editor, true)

    Promise.resolve().then(() => {
      FLUSHING.set(editor, false)
      const block = Editor.above(editor, {
        match: n => n === LAST_NODE.get(editor),
      })
      if (!block) return
      if (editor.isGrid(block[0]) || editor.isVoid(block[0])) {
        const path = block[1]
        const next = Editor.next(editor, {
          at: path,
        })
        if (
          !next ||
          (Element.isElement(next[0]) && (editor.isGrid(next[0]) || editor.isVoid(next[0])))
        ) {
          Transforms.insertNodes(
            editor,
            { type: 'paragraph', children: [{ text: '' }] },
            { at: Path.next(path) },
          )
        }
      }
    })
  }
}
