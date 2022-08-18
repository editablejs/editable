import { Editable, RenderElementProps } from "@editablejs/editor"
import { Transforms, Node } from "slate"
import { withTableCell } from "./cell"
import { Table, TableEditor, TableOptions, TABLE_OPTIONS_WEAKMAP } from "./editor"
import { withTableRow } from "./row"
import { TableReact } from "./table"

export const withTable =  <T extends Editable>(editor: T, options: TableOptions = {}) => {
  let newEditor = editor as T & TableEditor

  TABLE_OPTIONS_WEAKMAP.set(newEditor, options)
  
  newEditor = withTableCell(newEditor)
  newEditor = withTableRow(newEditor)

  const { isGrid, normalizeSelection } = editor

  newEditor.isGrid = (node: Node) => {
    return TableEditor.isTable(newEditor, node) || isGrid(node)
  }

  newEditor.normalizeSelection = (fn) => {
    const table = TableEditor.getTable(newEditor)
    if(table) {
      const {start, end} = TableEditor.edges(newEditor, table)
      const [startRow, startCol] = start
      const [endRow, endCol] = end
  
      const rowCount = endRow - startRow
      const colCount = endCol - startCol

      if(rowCount > 0 || colCount > 0) {
        const [, path] = table
        const cells = TableEditor.cells(newEditor, table, {
          startRow,
          startCol,
          endRow,
          endCol
        })
        for(const [cell, row, col] of cells) {
          if(!cell.span) {
            const anchor = Editable.toLowestPoint(newEditor, path.concat([row, col]))
            const focus = Editable.toLowestPoint(newEditor, path.concat([row, col]), 'end')
            fn({
              anchor,
              focus
            })
          }
        }
        Transforms.select(newEditor, {
          anchor: Editable.toLowestPoint(newEditor, path.concat([startRow, startCol])),
          focus: Editable.toLowestPoint(newEditor, path.concat([endRow, endCol])),
        })
        return
      }
    }
    
    normalizeSelection(fn)
  }

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