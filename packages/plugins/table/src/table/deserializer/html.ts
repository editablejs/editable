import {
  HTMLDeserializerOptions,
  HTMLDeserializerWithTransform,
} from '@editablejs/deserializer/html'
import { Editor, isDOMHTMLElement } from '@editablejs/models'
import { defaultTableMinColWidth } from '../../cell/options'
import { TableRow } from '../../row'
import { TABLE_KEY } from '../constants'
import { Table } from '../interfaces/table'
import { getOptions } from '../options'
import { calculateAverageColumnWidthInContainer } from '../utils'

export interface TableHTMLDeserializerOptions extends HTMLDeserializerOptions {
  editor: Editor
}

export const withTableHTMLDeserializerTransform: HTMLDeserializerWithTransform<
  TableHTMLDeserializerOptions
> = (next, serializer, { editor }) => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node) && node.nodeName === 'TABLE') {
      const children: TableRow[] = []
      for (const child of node.childNodes) {
        children.push(...(serializer.transform(child, { text, matchNewline: true }) as TableRow[]))
      }
      const { minColWidth = defaultTableMinColWidth } = getOptions(editor)
      const colsWidth = Array.from(node.querySelectorAll('col')).map(c => {
        const w = c.width || c.style.width
        return Math.min(parseInt(w === '' ? '0' : w, 10), minColWidth)
      })
      const colCount = children[0].children.length
      if (colsWidth.length === 0) {
        colsWidth.push(
          ...calculateAverageColumnWidthInContainer(editor, {
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
