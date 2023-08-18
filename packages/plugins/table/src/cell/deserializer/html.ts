import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { Descendant, isDOMHTMLElement } from '@editablejs/models'
import { TABLE_CELL_KEY } from '../constants'
import { TableCell } from '../interfaces/table-cell'

export const withTableCellHTMLDeserializerTransform: HTMLDeserializerWithTransform = (
  next,
  serializer,
) => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node) && node.nodeName === 'TD') {
      const children: Descendant[] = []
      for (const child of node.childNodes) {
        const content = serializer.transform(child, {
          text,
          matchNewline: true,
        })
        children.push(...content)
      }
      if (children.length === 0) {
        children.push({ children: [{ text: '' }] })
      }
      const { colSpan, rowSpan } = node as HTMLTableCellElement
      const cell: TableCell = {
        type: TABLE_CELL_KEY,
        children,
        colspan: colSpan,
        rowspan: rowSpan,
      }
      return [cell]
    }
    return next(node, options)
  }
}
