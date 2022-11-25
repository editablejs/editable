import { Descendant, HTMLDeserializerWithTransform, isDOMHTMLElement } from '@editablejs/editor'
import { TABLE_CELL_KEY } from '../constants'
import { TableCell } from '../types'

export const withTableCellDescendantTransform: HTMLDeserializerWithTransform = (
  next,
  serializer,
) => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node) && node.nodeName.toLowerCase() === 'TD') {
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
