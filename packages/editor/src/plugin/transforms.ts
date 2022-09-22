import {
  Point,
  Editor,
  Path,
  Transforms,
  Range,
  NodeEntry,
  Location,
  Node,
  Element,
  Text,
} from 'slate'
import { SelectionMoveOptions } from 'slate/dist/transforms/selection'
import { Editable } from './editable'
import { Grid } from '../interfaces/grid'
import { GridCell } from '../interfaces/cell'
import { TextInsertFragmentOptions } from 'slate/dist/transforms/text'

const getVoidPoint = (editor: Editable, point: Point, reverse: boolean) => {
  const voidElement = Editor.above(editor, {
    at: point,
    match: n => Editor.isVoid(editor, n),
  })
  if (voidElement && !editor.canFocusVoid(voidElement[0])) {
    const path = voidElement[1]
    const p = reverse ? Path.previous(path) : Path.next(path)
    return Editor.point(editor, p, {
      edge: reverse ? 'end' : 'start',
    })
  }
  return point
}

const { move } = Transforms

Transforms.move = (editor: Editor, options: SelectionMoveOptions = {}) => {
  if (Editable.isEditor(editor)) {
    const { selection } = editor
    const { distance = 1, unit = 'character', reverse = false } = options

    let { edge = null } = options

    if (!selection) {
      return
    }

    if (edge === 'start') {
      edge = Range.isBackward(selection) ? 'focus' : 'anchor'
    }

    if (edge === 'end') {
      edge = Range.isBackward(selection) ? 'anchor' : 'focus'
    }

    const { anchor, focus } = selection
    const opts = { distance, unit }
    const props: Partial<Range> = {}

    if (edge == null || edge === 'anchor') {
      const point = reverse
        ? Editor.before(editor, anchor, opts)
        : Editor.after(editor, anchor, opts)

      if (point) {
        props.anchor = point
      }
    }

    if (edge == null || edge === 'focus') {
      const point = reverse ? Editor.before(editor, focus, opts) : Editor.after(editor, focus, opts)

      if (point) {
        props.focus = point
      }
    }

    if (props.anchor) {
      props.anchor = getVoidPoint(editor, props.anchor, reverse)
    }

    if (props.focus) {
      props.focus = getVoidPoint(editor, props.focus, reverse)
    }

    Transforms.setSelection(editor, props)
  } else {
    move(editor, options)
  }
}

const {
  delete: defaultDelete,
  insertNodes: defaultInsertNodes,
  insertText: defaultInsertText,
} = Transforms

interface OperationTableValue {
  grid?: NodeEntry<Grid>
  start?: NodeEntry<GridCell>
  end?: NodeEntry<GridCell>
}

const getOperationGrid = (editor: Editor, at: Location | null = editor.selection) => {
  const value: OperationTableValue = {}
  if (Editable.isEditor(editor) && Range.isRange(at) && Range.isExpanded(at)) {
    const [anchor, focus] = Range.edges(at)
    const [startCell] = Editor.nodes<GridCell>(editor, {
      at: anchor.path,
      match: n => editor.isGridCell(n),
    })
    value.start = startCell
    const [endCell] = Editor.nodes<GridCell>(editor, {
      at: focus.path,
      match: n => editor.isGridCell(n),
    })
    value.end = endCell
    if (startCell && endCell) {
      if (Path.equals(startCell[1], endCell[1])) {
        value.start = undefined
        value.end = undefined
        return value
      }
      const [, startPath] = startCell
      const [, endPath] = endCell
      const gridPath = Path.common(startPath, endPath)
      const grid = Grid.findGrid(editor, gridPath)
      value.grid = grid
    }
  }
  return value
}

// 删除
Transforms.delete = (editor, options = {}) => {
  const { at = editor.selection } = options
  const { grid, start, end } = getOperationGrid(editor, at)
  // anchor 与 focus 在同一grid内
  if (Editable.isEditor(editor)) {
    if (grid) {
      const sel = Grid.getSelection(editor, grid)
      const selected = Grid.getSelected(editor, grid, sel)
      if (sel && selected) {
        const { allFull, rowFull, colFull, rows, cols } = selected
        if (allFull) {
          Grid.remove(editor, grid)
        } else if (rowFull) {
          for (let r = rows.length - 1; r >= 0; r--) {
            Grid.removeRow(editor, grid[1], rows[r])
          }
        } else if (colFull) {
          for (let c = cols.length - 1; c >= 0; c--) {
            Grid.removeCol(editor, grid[1], cols[c])
          }
        } else {
          // 设置 selection 到 anchor
          const { start, end } = Grid.edges(editor, grid, sel)
          const cells = Grid.cells(editor, grid, {
            startRow: start[0],
            startCol: start[1],
            endRow: end[0],
            endCol: end[1],
          })
          // 删除单元格内内容
          for (const [cell, row, col] of cells) {
            const path = grid[1].concat([row, col])
            Transforms.removeNodes(editor, {
              at: {
                anchor: {
                  path: path.concat(0),
                  offset: 0,
                },
                focus: {
                  path: path.concat(cell.children.length - 1),
                  offset: 0,
                },
              },
              match(node, path) {
                return !Editable.isGridCell(editor, node)
              },
            })
          }
          Grid.focus(editor, {
            at: grid,
            point: start,
          })
        }
        return
      }
      // 设置 selection 到 anchor
      Transforms.collapse(editor, { edge: 'anchor' })
    } else {
      const removeRow = (path: Path, start = true) => {
        const grid = Grid.findGrid(editor, path)
        if (grid) {
          const [row] = GridCell.toPoint(path)
          for (let r = start ? grid[0].children.length - 1 : row; r >= (start ? row : 0); r--) {
            Grid.removeRow(editor, grid[1], r)
          }
        }
      }
      // 开始位置选中在grid内
      if (start) {
        removeRow(start[1])
      }
      // 结束位置选中在grid内
      if (end) {
        removeRow(end[1], false)
        const { selection } = editor
        if (selection) {
          const { anchor, focus } = selection
          const focusGrid = Grid.findGrid(editor, focus.path)
          if (focusGrid) {
            const path = Path.previous(focusGrid[1])
            Transforms.select(editor, {
              anchor,
              focus: Editable.toLowestPoint(editor, path, 'end'),
            })
          }
        }
      }
      defaultDelete(editor, options)
    }
  } else {
    defaultDelete(editor, options)
  }
}

const handleInsertOnGrid = (editor: Editable, at: Location | null = editor.selection) => {
  const { grid, start, end } = getOperationGrid(editor, at)
  // anchor 与 focus 在同一grid内
  if (grid) {
    // 设置 selection 到 anchor
    Transforms.collapse(editor, { edge: 'anchor' })
  }
  // focus 在grid内
  else if (end) {
    Transforms.collapse(editor, { edge: 'anchor' })
    return false
  }
  // anchor 在grid内
  else if (start) {
    const [, startPath] = start
    const grid = Grid.findGrid(editor, startPath)
    if (grid) {
      const { children } = grid[0]
      const path = startPath.slice(0, -1)
      const rowIndex = path[path.length - 1]
      if (rowIndex === 0) {
        Grid.remove(editor, grid)
      } else {
        for (let r = children.length - 1; r >= rowIndex; r--) {
          Grid.removeRow(editor, grid[1], r)
        }
      }
      // 重新设置 anchor
      const nextPath = rowIndex === 0 ? grid[1] : Path.next(grid[1])
      const { selection } = editor
      if (selection) {
        Transforms.select(editor, {
          ...selection,
          anchor: Editable.toLowestPoint(editor, {
            path: nextPath,
            offset: 0,
          }),
        })
      }
    }
  }
  return true
}

Transforms.insertText = (editor, text, options = {}) => {
  const { at = editor.selection } = options
  if (Editable.isEditor(editor) && handleInsertOnGrid(editor, at)) {
    defaultInsertText(editor, text, options)
  }
}

Transforms.insertNodes = (editor, nodes, options = {}) => {
  const { at = editor.selection } = options
  if (Editable.isEditor(editor) && handleInsertOnGrid(editor, at)) {
    defaultInsertNodes(editor, nodes, options)
  }
}

export interface InsertFragmentOptions extends TextInsertFragmentOptions {}

Transforms.insertFragment = (
  editor: Editor,
  fragment: Node[],
  options: InsertFragmentOptions = {},
) => {
  Editor.withoutNormalizing(editor, () => {
    const { hanging = false, voids = false } = options
    let { at = editor.selection } = options

    if (!fragment.length) {
      return
    }

    if (!at) {
      return
    } else if (Range.isRange(at)) {
      if (!hanging) {
        at = Editor.unhangRange(editor, at)
      }

      if (Range.isCollapsed(at)) {
        at = at.anchor
      } else {
        const [, end] = Range.edges(at)

        if (!voids && Editor.void(editor, { at: end })) {
          return
        }

        const pointRef = Editor.pointRef(editor, end)
        Transforms.delete(editor, { at })
        at = pointRef.unref()!
      }
    } else if (Path.isPath(at)) {
      at = Editor.start(editor, at)
    }

    if (!voids && Editor.void(editor, { at })) {
      return
    }

    // If the insert point is at the edge of an inline node, move it outside
    // instead since it will need to be split otherwise.
    const inlineElementMatch = Editor.above(editor, {
      at,
      match: n => Editor.isInline(editor, n),
      mode: 'highest',
      voids,
    })

    if (inlineElementMatch) {
      const [, inlinePath] = inlineElementMatch

      if (Editor.isEnd(editor, at, inlinePath)) {
        const after = Editor.after(editor, inlinePath)!
        at = after
      } else if (Editor.isStart(editor, at, inlinePath)) {
        const before = Editor.before(editor, inlinePath)!
        at = before
      }
    }

    const blockMatch = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
      at,
      voids,
    })!
    const [, blockPath] = blockMatch
    const isBlockStart = Editor.isStart(editor, at, blockPath)
    const isBlockEnd = Editor.isEnd(editor, at, blockPath)
    const isBlockEmpty = isBlockStart && isBlockEnd
    const mergeStart = !isBlockStart || (isBlockStart && isBlockEnd)
    const mergeEnd = !isBlockEnd
    const [, firstPath] = Node.first({ children: fragment }, [])
    const [, lastPath] = Node.last({ children: fragment }, [])

    const matches: NodeEntry[] = []
    const matcher = ([n, p]: NodeEntry) => {
      const isRoot = p.length === 0
      if (isRoot) {
        return false
      }

      if (isBlockEmpty) {
        return true
      }

      if (
        mergeStart &&
        Path.isAncestor(p, firstPath) &&
        Element.isElement(n) &&
        (!Editable.isEditor(editor) || !editor.isGrid(n)) &&
        !editor.isVoid(n) &&
        !editor.isInline(n)
      ) {
        return false
      }

      if (
        mergeEnd &&
        Path.isAncestor(p, lastPath) &&
        Element.isElement(n) &&
        (!Editable.isEditor(editor) || !editor.isGrid(n)) &&
        !editor.isVoid(n) &&
        !editor.isInline(n)
      ) {
        return false
      }

      return true
    }

    for (const entry of Node.nodes({ children: fragment }, { pass: matcher })) {
      if (matcher(entry)) {
        matches.push(entry)
      }
    }

    const starts = []
    const middles = []
    const ends = []
    let starting = true
    let hasBlocks = false

    for (const [node] of matches) {
      if (Element.isElement(node) && !editor.isInline(node)) {
        starting = false
        hasBlocks = true
        middles.push(node)
      } else if (starting) {
        starts.push(node)
      } else {
        ends.push(node)
      }
    }

    const [inlineMatch] = Editor.nodes(editor, {
      at,
      match: n => Text.isText(n) || Editor.isInline(editor, n),
      mode: 'highest',
      voids,
    })!

    const [, inlinePath] = inlineMatch
    const isInlineStart = Editor.isStart(editor, at, inlinePath)
    const isInlineEnd = Editor.isEnd(editor, at, inlinePath)

    const middleRef = Editor.pathRef(
      editor,
      isBlockEnd && !ends.length ? Path.next(blockPath) : blockPath,
    )

    const endRef = Editor.pathRef(editor, isInlineEnd ? Path.next(inlinePath) : inlinePath)

    Transforms.splitNodes(editor, {
      at,
      match: n =>
        hasBlocks ? Editor.isBlock(editor, n) : Text.isText(n) || Editor.isInline(editor, n),
      mode: hasBlocks ? 'lowest' : 'highest',
      always: hasBlocks && (!isBlockStart || starts.length > 0) && (!isBlockEnd || ends.length > 0),
      voids,
    })

    const startRef = Editor.pathRef(
      editor,
      !isInlineStart || (isInlineStart && isInlineEnd) ? Path.next(inlinePath) : inlinePath,
    )

    Transforms.insertNodes(editor, starts, {
      at: startRef.current!,
      match: n => Text.isText(n) || Editor.isInline(editor, n),
      mode: 'highest',
      voids,
    })

    if (isBlockEmpty && !starts.length && middles.length && !ends.length) {
      Transforms.delete(editor, { at: blockPath, voids })
    }

    Transforms.insertNodes(editor, middles, {
      at: middleRef.current!,
      match: n => Editor.isBlock(editor, n),
      mode: 'lowest',
      voids,
    })

    Transforms.insertNodes(editor, ends, {
      at: endRef.current!,
      match: n => Text.isText(n) || Editor.isInline(editor, n),
      mode: 'highest',
      voids,
    })

    if (!options.at) {
      let path

      if (ends.length > 0 && endRef.current) {
        path = Path.previous(endRef.current)
      } else if (middles.length > 0 && middleRef.current) {
        path = Path.previous(middleRef.current)
      } else if (startRef.current) {
        path = Path.previous(startRef.current)
      }

      if (path) {
        const end = Editor.end(editor, path)
        Transforms.select(editor, end)
      }
    }

    startRef.unref()
    middleRef.unref()
    endRef.unref()
  })
}

export { Transforms }
