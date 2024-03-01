import {
  HTMLDeserializerOptions,
  HTMLDeserializerWithTransform,
} from '@editablejs/deserializer/html'
import { Descendant, Editor, isDOMHTMLElement, Text } from '@editablejs/models'
import { TABLE_CELL_KEY } from '../constants'

export interface TableCellHTMLDeserializerOptions extends HTMLDeserializerOptions {
  editor: Editor
}
export const withTableCellHTMLDeserializerTransform: HTMLDeserializerWithTransform<
  TableCellHTMLDeserializerOptions
> = (next, deserializer, { editor }) => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node) && ['TD', 'TH'].includes(node.nodeName)) {
      const children: Descendant[] = []
      let isFontWeight = false
      if (node.nodeName === 'TH') {
        isFontWeight = true
      }
      for (const child of node.childNodes) {
        const content = deserializer.transform(child, {
          text: {
            ...text,
            bold: isFontWeight ? true : undefined,
          },
          matchNewline: true,
        })
        children.push(...content)
      }
      if (children.length === 0) {
        children.push({ children: [{ text: '' }] })
      }
      const { colSpan, rowSpan } = node as HTMLTableCellElement

      const notBlocks: Descendant[] = []
      const newChildren: Descendant[] = []

      // 如果不是block，那么就把notBlocks里的内容放到一个新的child里
      const appendNotBlocks = () => {
        if (notBlocks.length > 0) {
          const newChild = { type: 'paragraph', children: notBlocks }
          newChildren.push(newChild)
          notBlocks.length = 0
        }
      }
      children.forEach(child => {
        // 2024/01/31 10:31:42@需求ID: 产品工作站代码优化@ZhaiCongrui/GW00247400：处理有的带有 链接 的单元格，编辑时回车光标跳到下个单元格的问题
        // child  的 type 为 link时，会有此类问题，所以单独处理
        if (!Editor.isBlock(editor, child)) {
          notBlocks.push(child)
        } else {
          if (notBlocks.length > 0) {
            appendNotBlocks()
          }
          newChildren.push(child)
        }
      })
      if (notBlocks.length > 0) {
        appendNotBlocks()
      }
      const span = node.getAttribute('span')?.split(',').map(Number)
      const cell = span
        ? {
            type: TABLE_CELL_KEY,
            children: newChildren,
            span,
          }
        : {
            type: TABLE_CELL_KEY,
            children: newChildren,
            colspan: colSpan,
            rowspan: rowSpan,
          }
      return [cell]
    }
    return next(node, options)
  }
}
