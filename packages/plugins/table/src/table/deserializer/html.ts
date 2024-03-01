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
import { supplementMergeCells } from './utils'

export interface TableHTMLDeserializerOptions extends HTMLDeserializerOptions {
  editor: Editor
}

export const withTableHTMLDeserializerTransform: HTMLDeserializerWithTransform<
  TableHTMLDeserializerOptions
> = (next, serializer, { editor }) => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node) && node.nodeName === 'TABLE') {
      const tableElement = node as HTMLTableElement
      const style = tableElement.getAttribute('style') ?? ''
      const ignoreTable =
        style.includes('display: none') ||
        style.includes('visibility: hidden') ||
        style.includes('mso-ignore:table')
      if (ignoreTable) {
        return []
      }
      supplementMergeCells(tableElement)
      const children: TableRow[] = []
      for (const child of tableElement.childNodes) {
        children.push(...(serializer.transform(child, { text, matchNewline: true }) as TableRow[]))
      }
      const { minColWidth = defaultTableMinColWidth } = getOptions(editor)
      // start update col Taylor
      const container = document.createElement('div')
      container.style.visibility = 'hidden'
      container.style.position = 'absolute'

      container.appendChild(tableElement)

      document.body.appendChild(container)
      if (tableElement.rows.length === 0) {
        return []
      }
      const firstRow = tableElement.rows[0]
      const newColgroup = document.createElement('colgroup')
      for (let i = 0; i < firstRow.cells.length; i++) {
        const cell = firstRow.cells[i]
        const colspan = cell.colSpan
        for (let j = 0; j < colspan; j++) {
          const col = document.createElement('col')
          const width = cell.offsetWidth
          col.style.width = `${width}px`
          newColgroup.appendChild(col)
        }
      }
      const colgroup = tableElement.querySelector('colgroup')
      if (colgroup) {
        node.removeChild(colgroup)
      }
      tableElement.insertBefore(newColgroup, tableElement.firstChild)
      document.body.removeChild(container)

      // the end update col Taylor
      const colsWidth = Array.from(node.querySelectorAll('col')).map(c => {
        const w = c.width || c.style.width
        return Math.max(parseInt(w === '' ? '0' : w, 10), minColWidth)
      })

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
