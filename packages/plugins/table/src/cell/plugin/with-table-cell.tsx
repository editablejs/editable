import { Editable } from '@editablejs/editor'
import { GridCell, Node } from '@editablejs/models'
import { CellInnerStyles, CellStyles } from '../../components/styles'
import { TableCellOptions, setOptions } from '../options'
import { TableCellEditor } from './table-cell-editor'

export const withTableCell = <T extends Editable>(editor: T, options: TableCellOptions = {}) => {
  const newEditor = editor as T & TableCellEditor
  const { renderElement, isGridCell } = editor

  setOptions(editor, options)

  newEditor.isGridCell = (node: Node): node is GridCell => {
    return TableCellEditor.isTableCell(newEditor, node) || isGridCell(node)
  }

  newEditor.renderElement = props => {
    const { element, attributes, children } = props
    if (TableCellEditor.isTableCell(newEditor, element)) {
      const { style, ...rest } = attributes
      return (
        <CellStyles
          rowSpan={element.rowspan ?? 1}
          colSpan={element.colspan ?? 1}
          style={{ ...style, display: element.span || element.children[0]?.text?.toString().indexOf('displaynone||||||') > -1 ? 'none' : '' }}
          {...rest}
        >
          <CellInnerStyles>{children}</CellInnerStyles>
        </CellStyles>
      )
    }
    return renderElement(props)
  }

  return newEditor
}
