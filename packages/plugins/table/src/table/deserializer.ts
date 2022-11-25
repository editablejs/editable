import {
  Editable,
  Grid,
  HTMLDeserializerOptions,
  HTMLDeserializerWithTransform,
  isDOMHTMLElement,
} from '@editablejs/editor'
import { TABLE_KEY } from '../constants'
import { getOptions } from '../options'
import { Table, TableRow } from '../types'

export interface TableHTMLDeserializerOptions extends HTMLDeserializerOptions {
  editor: Editable
}

export const withTableDescendantTransform: HTMLDeserializerWithTransform<
  TableHTMLDeserializerOptions
> = (next, serializer, { editor }) => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node) && node.nodeName.toLowerCase() === 'TABLE') {
      const children: TableRow[] = []
      for (const child of node.childNodes) {
        children.push(...(serializer.transform(child, { text, matchNewline: true }) as TableRow[]))
      }
      const { minColWidth } = getOptions(editor)
      const colsWidth = Array.from(node.querySelectorAll('col')).map(c => {
        const w = c.width || c.style.width
        return Math.min(parseInt(w === '' ? '0' : w, 10), minColWidth)
      })
      const colCount = children[0].children.length
      if (colsWidth.length === 0) {
        colsWidth.push(
          ...Grid.avgColWidth(editor, {
            cols: colCount,
            minWidth: minColWidth,
            getWidth: width => width - 1,
          }),
        )
      } else if (colsWidth.length < colCount) {
        // TODO
      } else if (colsWidth.length > colCount) {
        // TODO
      }

      const table: Table = {
        type: TABLE_KEY,
        colsWidth,
        children,
      }
      return [table]
    }
    return next(node, options)
  }
}
