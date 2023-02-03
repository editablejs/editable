import { Editable } from '@editablejs/editor'
import { Editor } from '@editablejs/models'

export interface CalculateAverageColumnWidthInContainerOptions {
  cols: number
  minWidth?: number
  getWidth?: (width: number) => number
}

export const calculateAverageColumnWidthInContainer = (
  editor: Editor,
  options: CalculateAverageColumnWidthInContainerOptions,
): number[] => {
  const { minWidth = 10, cols, getWidth } = options
  const container = Editable.toDOMNode(editor, editor)
  const rect = container.getBoundingClientRect()
  const width = getWidth ? getWidth(rect.width) : 0
  const colWidth = Math.max(minWidth, Math.floor(width / cols))

  const tableColsWdith = []
  let colsWidth = 0
  for (let c = 0; c < cols; c++) {
    const cws = colsWidth + colWidth
    if (c === cols - 1 && cws < width) {
      const cw = width - colsWidth
      colsWidth += cw
      tableColsWdith.push(cw)
    } else {
      colsWidth = cws
      tableColsWdith.push(colWidth)
    }
  }
  return tableColsWdith
}

export const adaptiveExpandColumnWidthInContainer = (
  editor: Editor,
  colsWidth: number[],
  minWidth = 5,
): number[] => {
  const container = Editable.toDOMNode(editor, editor)
  const containerRect = container.getBoundingClientRect()
  const { width: containerWidth } = containerRect
  const widths = colsWidth.concat()
  let gridWidth = widths.reduce((a, b) => a + b, 0)
  while (gridWidth > containerWidth) {
    let minCount = 0
    for (let i = 0; i < widths.length; i++) {
      const w = widths[i]
      if (w > minWidth) {
        widths[i] = w - 1
        gridWidth--
        if (gridWidth <= containerWidth) break
      } else {
        minCount++
      }
    }
    if (minCount === widths.length) break
  }
  return widths
}
