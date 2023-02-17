import {
  Editor as SlateEditor,
  Node,
  Text,
  Element,
  EditorPointOptions,
  Point,
  Location,
  createEditor as createSlateEditor,
  Transforms,
  BaseRange,
  EditorInterface as SlateEditorInterface,
  EditorMarks,
  NodeEntry,
  Range,
  Path,
  Operation,
} from 'slate'
import { GridCell } from './cell'
import { CompositionText } from './composition-text'
import { Grid } from './grid'
import { List } from './list'
import { GridRow } from './row'

export interface EditorElements {
  [key: string]: NodeEntry<Element>[]
}

const EDITOR_ACTIVE_MARKS = new WeakMap<Editor, EditorMarks>()

const EDITOR_ACTIVE_ELEMENTS = new WeakMap<Editor, EditorElements>()

interface EditorInterface extends SlateEditorInterface {
  isSolidVoid: (editor: SlateEditor, element: Element) => boolean
  isGrid: (editor: SlateEditor, value: any) => value is Grid
  isGridRow: (editor: SlateEditor, value: any) => value is GridRow
  isGridCell: (editor: SlateEditor, value: any) => value is GridCell
  isList: (editor: SlateEditor, value: any) => value is List
  isEmpty: (editor: SlateEditor, node: Node) => boolean
  marks: (editor: SlateEditor, at?: Location) => EditorMarks
  elements: (editor: SlateEditor, at?: Location) => EditorElements
}

const startPoint = (root: Node, at: Point): Point => {
  const { path } = at
  const p = path.slice()
  let n = Node.get(root, p)
  let offset = at.offset
  while (n) {
    if (Text.isText(n) || n.children.length === 0) {
      break
    } else {
      const index = Math.min(offset, n.children.length - 1)
      n = n.children[index]
      p.push(index)
      offset = 0
    }
  }
  return {
    path: p,
    offset,
  }
}

const endPoint = (root: Node, at: Point): Point => {
  const { path } = at
  const p = path.slice()
  let n = Node.get(root, p)
  let offset = at.offset
  while (n) {
    if (Text.isText(n) || n.children.length === 0) {
      break
    } else {
      const index = Math.min(offset, n.children.length - 1)
      n = n.children[index]
      p.push(index)
      offset = Element.isElement(n) ? n.children.length : n.text.length
    }
  }
  return {
    path: p,
    offset,
  }
}

const marks = (editor: SlateEditor): EditorMarks | null => {
  const { selection } = editor
  if (!selection) return null
  if (Range.isExpanded(selection)) {
    const [match] = Editor.nodes(editor, { match: Text.isText })

    if (match) {
      const [node] = match as NodeEntry<Text>
      const { text, ...rest } = node
      return rest
    } else {
      return {}
    }
  }

  const { anchor } = selection
  const { path } = anchor
  let [node] = Editor.leaf(editor, path)

  if (anchor.offset === 0) {
    const prev = Editor.previous(editor, { at: path, match: Text.isText })
    const markedVoid = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isVoid(editor, n) && editor.markableVoid(n),
    })
    if (!markedVoid) {
      const block = Editor.above(editor, {
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      })

      if (prev && block) {
        const [prevNode, prevPath] = prev
        const [, blockPath] = block

        if (Path.isAncestor(blockPath, prevPath)) {
          node = prevNode as Text
        }
      }
    }
  }

  const { text, ...rest } = node
  return rest
}

SlateEditor.marks = (editor: SlateEditor, at?: Location) => {
  const caches = EDITOR_ACTIVE_MARKS.get(editor)
  if (caches && !at) return caches
  let editorMarks: EditorMarks = {}
  const prevSelection = editor.selection
  if (at) editor.selection = Editor.range(editor, at)
  editor.normalizeSelection(selection => {
    if (editor.selection !== selection) editor.selection = selection
    Object.assign(editorMarks, marks(editor) ?? {})
  })
  editor.selection = prevSelection
  if (!at) EDITOR_ACTIVE_MARKS.set(editor, editorMarks)
  return editorMarks
}

const { point: slatePoint } = SlateEditor

SlateEditor.point = (editor: SlateEditor, at: Location, options: EditorPointOptions = {}) => {
  if (Point.isPoint(at)) {
    const { edge = 'start' } = options
    if (edge === 'end') {
      return endPoint(editor, at)
    } else {
      return startPoint(editor, at)
    }
  } else {
    return slatePoint(editor, at, options)
  }
}

SlateEditor.isEmpty = (editor: Editor, node: Node): boolean => {
  if (Text.isText(node)) return node.text === '' && !CompositionText.isCompositionText(node)
  else if (node.children.length === 0) return true
  else if (node.children.length === 1)
    return !Editor.isVoid(editor, node) && SlateEditor.isEmpty(editor, node.children[0] as Element)
  else return false
}

export const Editor: EditorInterface = {
  ...SlateEditor,

  isEmpty: (editor: SlateEditor, node: Node) => SlateEditor.isEmpty(editor, node as Element),

  isSolidVoid: (editor: SlateEditor, element: Element) => {
    return editor.isSolidVoid(element)
  },
  isGrid(editor: SlateEditor, value: any): value is Grid {
    return editor.isGrid(value)
  },

  isGridRow(editor: SlateEditor, value: any): value is GridRow {
    return editor.isGridRow(value)
  },

  isGridCell(editor: SlateEditor, value: any): value is GridCell {
    return editor.isGridCell(value)
  },

  isList(editor: SlateEditor, value: any): value is List {
    return editor.isList(value)
  },

  marks: SlateEditor.marks as (editor: SlateEditor) => EditorMarks,

  elements(editor: SlateEditor, at?: Location) {
    let caches = EDITOR_ACTIVE_ELEMENTS.get(editor)
    if (caches && !at) return caches
    const prevSelection = editor.selection
    if (at) editor.selection = Editor.range(editor, at)
    const editorElements: EditorElements = {}
    editor.normalizeSelection(selection => {
      if (selection === null) return
      const nodeEntries = Editor.nodes<Element>(editor, {
        at: selection,
        match: n => !Editor.isEditor(n) && Element.isElement(n),
      })

      for (const entry of nodeEntries) {
        const type = entry[0].type ?? 'paragraph'
        if (editorElements[type]) editorElements[type].push(entry)
        else editorElements[type] = [entry]
      }
    })
    editor.selection = prevSelection
    if (!at) EDITOR_ACTIVE_ELEMENTS.set(editor, editorElements)
    return editorElements
  },
}

export * from 'slate'

export const createEditor = () => {
  const baseEditor = createSlateEditor()

  const { apply, onChange } = baseEditor

  baseEditor.apply = (op: Operation) => {
    EDITOR_ACTIVE_MARKS.delete(baseEditor)
    EDITOR_ACTIVE_ELEMENTS.delete(baseEditor)

    apply(op)
  }

  baseEditor.onChange = () => {
    EDITOR_ACTIVE_MARKS.delete(baseEditor)
    EDITOR_ACTIVE_ELEMENTS.delete(baseEditor)

    onChange()
  }

  baseEditor.isSolidVoid = (value: Element) => true

  baseEditor.isGrid = (value: any): value is Grid => false

  baseEditor.isGridRow = (value: any): value is GridRow => false

  baseEditor.isGridCell = (value: any): value is GridCell => false

  baseEditor.isList = (value: any): value is List => false

  baseEditor.normalizeSelection = (fn, at) => {
    const selection = at ? Editor.range(baseEditor, at) : baseEditor.selection
    if (!selection) return fn(selection)
    const grid = Grid.above(baseEditor, selection)
    if (grid) {
      const sel = Grid.getSelection(baseEditor, grid)
      if (sel) {
        let { start, end } = sel
        const [startRow, startCol] = start
        const [endRow, endCol] = end

        const rowCount = endRow - startRow
        const colCount = endCol - startCol

        if (rowCount > 0 || colCount > 0) {
          const [, path] = grid
          const edgesSelection = Grid.edges(baseEditor, grid, sel)
          const { start: edgeStart, end: edgeEnd } = edgesSelection
          const cells = Grid.cells(baseEditor, grid, {
            startRow: edgeStart[0],
            startCol: edgeStart[1],
            endRow: edgeEnd[0],
            endCol: edgeEnd[1],
          })
          const rangeRef = Editor.rangeRef(baseEditor, selection)
          for (const [cell, row, col] of cells) {
            if (!cell) break
            if (!cell.span) {
              const range = Editor.range(baseEditor, path.concat([row, col]))
              fn(range, { grid, row, col })
            }
          }
          const range = rangeRef.unref()
          Transforms.select(baseEditor, range ?? selection)
          return
        }
      }
    }
    fn(selection)
  }

  baseEditor.getFragment = (range?: BaseRange) => {
    const selection = range ?? baseEditor.selection
    if (!selection) return []
    const grid = Grid.above(baseEditor)
    if (grid) {
      const sel = Grid.getSelection(baseEditor, grid)
      const selected = Grid.getSelected(baseEditor, grid, sel)
      if (selected) {
        const { colFull, rowFull, cols, rows } = selected
        if (colFull || rowFull || cols.length > 1 || rows.length > 1) {
          const fragment = Grid.getFragment(baseEditor, grid, sel)
          return fragment ? [fragment] : []
        } else if (cols.length === 1 || rows.length === 1) {
          const cell = Grid.getCell(baseEditor, grid, [rows[0], cols[0]])
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
    return Node.fragment(baseEditor, selection)
  }

  return baseEditor
}

export {
  Element,
  Location,
  Node,
  Operation,
  Path,
  PathRef,
  Point,
  PointRef,
  Range,
  RangeRef,
  Scrubber,
  Span,
  Text,
} from 'slate'
export type Editor = SlateEditor
export type { EditorInterface }
