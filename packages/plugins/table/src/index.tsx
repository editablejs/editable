import { Editable, RenderElementProps, Transforms, Node, Grid, Locale } from '@editablejs/editor'
import { withTableCell } from './cell'
import locales from './locale'
import { setOptions, TableOptions } from './options'
import { withTableRow } from './row'
import { TableEditor, TableComponent } from './table'
import { Table } from './types'

export const withTable = <T extends Editable>(editor: T, options: TableOptions = {}) => {
  let newEditor = editor as T & TableEditor

  setOptions(newEditor, options)

  for (const key in locales) {
    Locale.setLocale(newEditor, key, locales[key])
  }

  for (const key in options.locales) {
    Locale.setLocale(newEditor, key, locales[key])
  }

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

  return newEditor
}

export { TableEditor }

export type { TableOptions }
export * from './types'
