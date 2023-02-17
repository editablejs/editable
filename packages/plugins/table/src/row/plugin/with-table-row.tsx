import { Editable, RenderElementProps, useIsomorphicLayoutEffect } from '@editablejs/editor'
import { Transforms, GridRow, Editor, Node } from '@editablejs/models'
import { useTableSize } from '../../context'
import { RowStyles } from '../../components/styles'
import { TableRow } from '../interfaces/table-row'
import { getOptions, setOptions, TableRowOptions } from '../options'
import { TableRowEditor } from './table-row-editor'
import { RowStore } from '../store'

interface TableRowProps extends React.AnchorHTMLAttributes<HTMLTableRowElement> {
  editor: Editor
  element: TableRow
}

const Row: React.FC<TableRowProps & RenderElementProps<TableRow, HTMLTableRowElement>> = ({
  editor,
  element,
  attributes,
  children,
}) => {
  const { style, ref, ...rest } = attributes
  // 表格宽度变化导致挤压内容需要重新计算高度
  const { width } = useTableSize()
  // 单元格内容变动后重新计算行的高度
  useIsomorphicLayoutEffect(() => {
    let maxHeight = getOptions(editor).minRowHeight
    const rect = ref.current.getBoundingClientRect()
    maxHeight = Math.max(maxHeight, rect.height)
    if (maxHeight !== RowStore.getContentHeight(element)) {
      RowStore.setContentHeight(element, maxHeight)
    }
  }, [editor, ref, width, element])

  return (
    <RowStyles ref={ref} style={{ height: element.height, ...style }} {...rest}>
      {children}
    </RowStyles>
  )
}

export const withTableRow = <T extends Editable>(editor: T, options: TableRowOptions = {}) => {
  const newEditor = editor as T & TableRowEditor
  const { renderElement, isGridRow } = editor

  setOptions(editor, options)

  newEditor.isGridRow = (node: Node): node is GridRow => {
    return TableRowEditor.isTableRow(newEditor, node) || isGridRow(node)
  }

  newEditor.renderElement = props => {
    const { element, attributes, children } = props
    if (TableRowEditor.isTableRow(newEditor, element)) {
      return (
        <Row editor={editor} element={element} attributes={attributes}>
          {children}
        </Row>
      )
    }
    return renderElement(props)
  }

  return newEditor
}
