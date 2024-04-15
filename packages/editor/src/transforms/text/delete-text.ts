import { TextTransforms } from '../../interfaces/transforms/text'
import { Editor } from '../../interfaces/editor'
import { Range } from '../../interfaces/range'
import { Point } from '../../interfaces/point'
import { Path } from '../../interfaces/path'
import { Transforms } from '../../interfaces/transforms'
import { Element } from '../../interfaces/element'
import { NodeEntry } from '../../interfaces/node'
import { Grid, GridCell } from '../../interfaces'
import { findGridOfEdges } from '../utils'

export const deleteText: TextTransforms['delete'] = (editor, options = {}) => {
  const { at = editor.selection } = options
  const { grid, start, end } = findGridOfEdges(editor, at)

  // anchor 与 focus 在同一grid内
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
            match(node) {
              return !GridCell.isGridCell(node)
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
      const grid = Grid.above(editor, path)
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
        const focusGrid = Grid.above(editor, focus.path)
        if (focusGrid) {
          const path = Path.previous(focusGrid[1])
          Transforms.select(editor, {
            anchor,
            focus: Editor.end(editor, path),
          })
        }
      }
    }
    const beforeGrid = Grid.above(editor)
    Editor.withoutNormalizing(editor, () => {
      const {
        reverse = false,
        unit = 'character',
        distance = 1,
        voids = false,
      } = options
      let { at = editor.selection, hanging = false } = options

      if (!at) {
        return
      }

      let isCollapsed = false
      if (Range.isRange(at) && Range.isCollapsed(at)) {
        isCollapsed = true
        at = at.anchor
      }

      if (Point.isPoint(at)) {
        const furthestVoid = Editor.void(editor, { at, mode: 'highest' })

        if (!voids && furthestVoid) {
          const [, voidPath] = furthestVoid
          at = voidPath
        } else {
          const opts = { unit, distance }
          const target = reverse
            ? Editor.before(editor, at, opts) || Editor.start(editor, [])
            : Editor.after(editor, at, opts) || Editor.end(editor, [])
          at = { anchor: at, focus: target }
          hanging = true
        }
      }

      if (Path.isPath(at)) {
        Transforms.removeNodes(editor, { at, voids })
        return
      }

      if (Range.isCollapsed(at)) {
        return
      }

      if (!hanging) {
        const [, end] = Range.edges(at)
        const endOfDoc = Editor.end(editor, [])

        if (!Point.equals(end, endOfDoc)) {
          at = Editor.unhangRange(editor, at, { voids })
        }
      }

      let [start, end] = Range.edges(at)
      const startBlock = Editor.above(editor, {
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        at: start,
        voids,
      })
      const endBlock = Editor.above(editor, {
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        at: end,
        voids,
      })
      const isAcrossBlocks =
        startBlock && endBlock && !Path.equals(startBlock[1], endBlock[1])
      const isSingleText = Path.equals(start.path, end.path)
      const startNonEditable = voids
        ? null
        : Editor.void(editor, { at: start, mode: 'highest' }) ??
        Editor.elementReadOnly(editor, { at: start, mode: 'highest' })
      const endNonEditable = voids
        ? null
        : Editor.void(editor, { at: end, mode: 'highest' }) ??
        Editor.elementReadOnly(editor, { at: end, mode: 'highest' })

      // If the start or end points are inside an inline void, nudge them out.
      if (startNonEditable) {
        const before = Editor.before(editor, start)

        if (before && startBlock && Path.isAncestor(startBlock[1], before.path)) {
          start = before
        }
      }

      if (endNonEditable) {
        const after = Editor.after(editor, end)

        if (after && endBlock && Path.isAncestor(endBlock[1], after.path)) {
          end = after
        }
      }

      // Get the highest nodes that are completely inside the range, as well as
      // the start and end nodes.
      const matches: NodeEntry[] = []
      let lastPath: Path | undefined

      for (const entry of Editor.nodes(editor, { at, voids })) {
        const [node, path] = entry

        if (lastPath && Path.compare(path, lastPath) === 0) {
          continue
        }

        if (
          (!voids &&
            Element.isElement(node) &&
            (Editor.isVoid(editor, node) ||
              Editor.isElementReadOnly(editor, node))) ||
          (!Path.isCommon(path, start.path) && !Path.isCommon(path, end.path))
        ) {
          matches.push(entry)
          lastPath = path
        }
      }

      const pathRefs = Array.from(matches, ([, p]) => Editor.pathRef(editor, p))
      const startRef = Editor.pointRef(editor, start)
      const endRef = Editor.pointRef(editor, end)

      let removedText = ''

      if (!isSingleText && !startNonEditable) {
        const point = startRef.current!
        const [node] = Editor.leaf(editor, point)
        const { path } = point
        const { offset } = start
        const text = node.text.slice(offset)
        if (text.length > 0) {
          editor.apply({ type: 'remove_text', path, offset, text })
          removedText = text
        }
      }

      pathRefs
        .reverse()
        .map(r => r.unref())
        .filter((r): r is Path => r !== null)
        .forEach(p => Transforms.removeNodes(editor, { at: p, voids }))

      if (!endNonEditable) {
        const point = endRef.current!
        const [node] = Editor.leaf(editor, point)
        const { path } = point
        const offset = isSingleText ? start.offset : 0
        const text = node.text.slice(offset, end.offset)
        if (text.length > 0) {
          editor.apply({ type: 'remove_text', path, offset, text })
          removedText = text
        }
      }

      if (!isSingleText && isAcrossBlocks && endRef.current && startRef.current) {
        Transforms.mergeNodes(editor, {
          at: endRef.current,
          hanging: true,
          voids,
        })
      }

      // For Thai script, deleting N character(s) backward should delete
      // N code point(s) instead of an entire grapheme cluster.
      // Therefore, the remaining code points should be inserted back.
      if (
        isCollapsed &&
        reverse &&
        unit === 'character' &&
        removedText.length > 1 &&
        removedText.match(/[\u0E00-\u0E7F]+/)
      ) {
        Transforms.insertText(
          editor,
          removedText.slice(0, removedText.length - distance)
        )
      }

      const startUnref = startRef.unref()
      const endUnref = endRef.unref()
      const point = reverse ? startUnref || endUnref : endUnref || startUnref

      if (options.at == null && point) {
        Transforms.select(editor, point)
      }

      // After deletion, if the current position is in the grid, it means that the empty line has been deleted and the focus is on the grid, so select the entire grid.
      if (!start && !end && editor.selection && Range.isCollapsed(editor.selection)) {
        const afterGrid = Grid.above(editor, editor.selection)
        if (!afterGrid || (beforeGrid && Path.equals(beforeGrid[1], afterGrid[1]))) return
        Grid.select(editor, afterGrid)
      }
    })
  }
}
