import {
  Editable,
  RenderElementProps,
  Transforms,
  Node,
  Grid,
  isDOMElement,
} from '@editablejs/editor'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import { withTableCell } from './cell'
import { TableOptions } from './context'
import { getOptions, setOptions } from './options'
import { TableRow, withTableRow } from './row'
import { TableEditor, TableComponent, Table, TABLE_KEY } from './table'

export const withTable = <T extends Editable>(editor: T, options: TableOptions = {}) => {
  let newEditor = editor as T & TableEditor

  setOptions(newEditor, options)

  newEditor = withTableCell(newEditor)
  newEditor = withTableRow(newEditor)

  const { isGrid } = editor

  newEditor.isGrid = (node: Node): node is Table => {
    return TableEditor.isTable(newEditor, node) || isGrid(node)
  }

  newEditor.toggleTable = options => {
    const table = TableEditor.create(newEditor, options)
    Transforms.insertNodes(newEditor, table)
    Grid.focus(newEditor, {
      point: [0, 0],
    })
  }

  const { renderElement } = newEditor

  newEditor.renderElement = props => {
    if (TableEditor.isTable(newEditor, props.element)) {
      return <TableComponent editor={newEditor} {...(props as RenderElementProps<Table>)} />
    }
    return renderElement(props)
  }

  SerializeEditor.with(newEditor, e => {
    const { serializeHtml, deserializeHtml } = e

    e.serializeHtml = options => {
      const { node, attributes, styles } = options
      if (TableEditor.isTable(newEditor, node)) {
        const { colsWidth } = node
        const colgroup = colsWidth?.map(w => SerializeEditor.createHtml('col', {}, { width: w }))
        return SerializeEditor.createHtml(
          TABLE_KEY,
          attributes,
          {
            ...styles,
            'table-layout': 'fixed',
            'border-collapse': 'collapse',
            'white-space': 'pre-wrap',
          },
          `<colgroup>${colgroup?.join('')}</colgroup><tbody>${node.children
            .map(child => e.serializeHtml({ node: child }))
            .join('')}</tbody>`,
        )
      }
      return serializeHtml(options)
    }

    e.deserializeHtml = options => {
      const { node, markAttributes } = options
      if (isDOMElement(node) && node.nodeName === 'TABLE') {
        const children: TableRow[] = []
        for (const child of node.childNodes) {
          children.push(
            ...(e.deserializeHtml({ node: child, markAttributes, stripBreak: true }) as any),
          )
        }
        const { minColWidth } = getOptions(e)
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
      return deserializeHtml(options)
    }
  })

  return newEditor
}

export { TableEditor }

export type { TableOptions }
