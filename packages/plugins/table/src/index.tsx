import { Editable, RenderElementProps, Transforms, Node, Grid } from '@editablejs/editor'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import { withTableCell } from './cell'
import { TableOptions } from './context'
import { withTableRow } from './row'
import { TableEditor, TableComponent, TABLE_OPTIONS_WEAKMAP, Table, TABLE_KEY } from './table'

export const withTable = <T extends Editable>(editor: T, options: TableOptions = {}) => {
  let newEditor = editor as T & TableEditor

  TABLE_OPTIONS_WEAKMAP.set(newEditor, options)

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
    const { serializeHtml } = e

    e.serializeHtml = options => {
      const { node, attributes, styles } = options
      if (TableEditor.isTable(newEditor, node)) {
        const { colsWidth } = node
        const colgroup = colsWidth?.map(w => SerializeEditor.createHtml('col', {}, { width: w }))
        debugger
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
  })

  return newEditor
}

export { TableEditor }

export type { TableOptions }
