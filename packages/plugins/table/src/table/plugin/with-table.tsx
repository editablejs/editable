import { Editable, RenderElementProps, Locale } from '@editablejs/editor'
import { Transforms, Node, Grid } from '@editablejs/models'
import { withTableCell } from '../../cell'
import locale from '../../locale'
import { setOptions, TableOptions } from '../options'
import { withTableRow } from '../../row'
import { TableEditor } from './table-editor'
import { Table } from '../interfaces/table'
import { TableComponent } from '../../components/table'
import { withShortcuts } from './with-shortcuts'

export const withTable = <T extends Editable>(editor: T, options: TableOptions = {}) => {
  let newEditor = editor as T & TableEditor

  setOptions(newEditor, options)

  const { locale: localeOptions = {} } = options
  Locale.setLocale(newEditor, locale, localeOptions)

  newEditor = withTableCell(newEditor)
  newEditor = withTableRow(newEditor)

  const { isGrid } = editor

  newEditor.isGrid = (node: Node): node is Table => {
    return TableEditor.isTable(newEditor, node) || isGrid(node)
  }

  newEditor.insertTable = options => {
    const table = Table.isTable(options) ? options : TableEditor.create(newEditor, options)
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

  const { shortcuts } = options
  if (shortcuts !== false) {
    withShortcuts(newEditor)
  }
  return newEditor
}
