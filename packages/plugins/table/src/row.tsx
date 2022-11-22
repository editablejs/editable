import {
  Editable,
  RenderElementProps,
  Editor,
  Node,
  Element,
  Transforms,
  GridRow,
  isDOMElement,
  Descendant,
} from '@editablejs/editor'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import React, { useLayoutEffect } from 'react'
import { TableCell, TableCellEditor } from './cell'
import { useTableSize } from './context'
import { getOptions } from './options'
import { RowStyles } from './styles'

export const TABLE_ROW_KEY = 'table-row'

export interface TableRowOptions {}

export interface TableRow extends Element {
  type: typeof TABLE_ROW_KEY
  children: TableCell[]
  height?: number
  contentHeight?: number
}

export interface TableRowEditor extends Editable {}

export const TableRowEditor = {
  isTableRow: (editor: Editable, n: Node): n is TableRow => {
    return Editor.isBlock(editor, n) && n.type === TABLE_ROW_KEY
  },

  isActive: (editor: Editable): boolean => {
    const elements = editor.queryActiveElements()[TABLE_ROW_KEY] ?? []
    return elements.some(e => TableRowEditor.isTableRow(editor, e[0]))
  },

  create: (
    row: Partial<Omit<TableRow, 'type' | 'children'>> = {},
    cells: Partial<Omit<TableCell, 'type' | 'children'>>[],
  ): TableRow => {
    const { height, contentHeight = height, ...rest } = row
    return {
      type: TABLE_ROW_KEY,
      children: cells.map(cell => TableCellEditor.create(cell)),
      height,
      contentHeight,
      ...rest,
    }
  },
}

interface TableRowProps extends React.AnchorHTMLAttributes<HTMLTableRowElement> {
  editor: Editable
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
  useLayoutEffect(() => {
    let maxHeight = getOptions(editor).minRowHeight
    const rect = ref.current.getBoundingClientRect()
    maxHeight = Math.max(maxHeight, rect.height)
    if (maxHeight !== element.contentHeight) {
      Transforms.setNodes<TableRow>(
        editor,
        { contentHeight: maxHeight },
        {
          at: Editable.findPath(editor, element),
        },
      )
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

  SerializeEditor.with(newEditor, e => {
    const { serializeHtml, deserializeHtml } = e

    e.serializeHtml = options => {
      const { node, attributes, styles } = options
      if (TableRowEditor.isTableRow(newEditor, node)) {
        const { height } = node
        return SerializeEditor.createHtml(
          'tr',
          attributes,
          {
            ...styles,
            height: `${height}px`,
            margin: '0px',
            padding: '0px',
          },
          node.children.map(child => e.serializeHtml({ node: child })).join(''),
        )
      }
      return serializeHtml(options)
    }

    e.deserializeHtml = options => {
      const { node, markAttributes } = options
      if (isDOMElement(node) && ['TR', 'TH'].includes(node.tagName)) {
        const options = getOptions(e)
        const h = (node as HTMLElement).style.height
        const height = parseInt(h === '' ? '0' : h, 10)

        const children: TableCell[] = []
        for (const child of node.childNodes) {
          children.push(
            ...(e.deserializeHtml({ node: child, markAttributes, stripBreak: true }) as any),
          )
        }

        const row: TableRow = {
          type: TABLE_ROW_KEY,
          height: Math.max(height, options.minRowHeight),
          children,
        }
        return [row]
      }
      return deserializeHtml(options)
    }
  })

  return newEditor
}
