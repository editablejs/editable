import { Editable, RenderElementProps } from "@editablejs/editor"
import { Transforms } from "slate"
import { withTableCell } from "./cell"
import { Table, TableEditor, TableOptions, TABLE_OPTIONS_WEAKMAP } from "./editor"
import { withTableRow } from "./row"
import { TableReact } from "./table"

export const withTable =  <T extends Editable>(editor: T, options: TableOptions = {}) => {
  let newEditor = editor as T & TableEditor

  TABLE_OPTIONS_WEAKMAP.set(newEditor, options)
  
  newEditor = withTableCell(newEditor)
  newEditor = withTableRow(newEditor)

  newEditor.toggleTable = (options) => {
    const table = TableEditor.create(newEditor, options)
    Transforms.insertNodes(editor, table, {
      select: false
    })
    TableEditor.focus(newEditor, {
      point: [0, 0]
    })
  }

  const { renderElement } = newEditor

  newEditor.renderElement = (props) => { 
    if(TableEditor.isTable(newEditor, props.element)) {
      return <TableReact editor={newEditor} {...(props as RenderElementProps<Table>)}/>
    }
    return renderElement(props)
  }
  return newEditor
}

export * from './editor'