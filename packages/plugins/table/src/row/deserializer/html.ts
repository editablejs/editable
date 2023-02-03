import {
  HTMLDeserializerOptions,
  HTMLDeserializerWithTransform,
} from '@editablejs/deserializer/html'
import { Editor, isDOMHTMLElement } from '@editablejs/models'
import { TableCell } from '../../cell'
import { TABLE_ROW_KEY } from '../constants'
import { getOptions } from '../options'
import { TableRow } from '../interfaces/table-row'

export interface TableRowHTMLDeserializerOptions extends HTMLDeserializerOptions {
  editor: Editor
}

export const withTableRowHTMLDeserializerTransform: HTMLDeserializerWithTransform<
  TableRowHTMLDeserializerOptions
> = (next, serializer, { editor }) => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node) && ['TR', 'TH'].includes(node.tagName)) {
      const options = getOptions(editor)
      const h = (node as HTMLElement).style.height
      const height = parseInt(!h ? '0' : h, 10)

      const children: TableCell[] = []
      for (const child of node.childNodes) {
        children.push(...(serializer.transform(child, { text, matchNewline: true }) as any))
      }

      const row: TableRow = {
        type: TABLE_ROW_KEY,
        height: Math.max(height, options.minRowHeight),
        children,
      }
      return [row]
    }
    return next(node, options)
  }
}
