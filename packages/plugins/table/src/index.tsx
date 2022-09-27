import {
  Editable,
  RenderElementProps,
  Transforms,
  Node,
  Grid,
  isDOMElement,
  Locale,
} from '@editablejs/editor'
import { ContextMenuEditor } from '@editablejs/plugin-context-menu'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import { Icon } from '@editablejs/plugin-ui'
import { withTableCell } from './cell'
import { TableOptions } from './context'
import locales, { TableLocale } from './locale'
import { getOptions, setOptions } from './options'
import { TableRow, withTableRow } from './row'
import { TableEditor, TableComponent, Table, TABLE_KEY } from './table'

export const withTable = <T extends Editable>(editor: T, options: TableOptions = {}) => {
  let newEditor = editor as T & TableEditor

  setOptions(newEditor, options)

  for (const key in locales) {
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

  ContextMenuEditor.with(newEditor, e => {
    const { onContextMenu } = e
    e.onContextMenu = items => {
      const grid = Grid.findGrid(e)
      if (!grid) return onContextMenu(items)
      const locale = Locale.getLocale<TableLocale>(e).table

      items.push({
        type: 'separator',
      })
      items.push({
        key: 'merge_cells',
        icon: <Icon name="tableMerge" />,
        title: locale.mergeCells,
        disabled: !Grid.canMerge(e, grid),
        onSelect: () => {
          Grid.mergeCell(e, grid)
        },
      })

      items.push({
        key: 'split_cells',
        icon: <Icon name="tableSplit" />,
        title: locale.splitCells,
        disabled: !Grid.canSplit(e, grid),
        onSelect: () => {
          Grid.splitCell(e, grid)
        },
      })

      return onContextMenu(items)
    }
  })

  return newEditor
}

export { TableEditor }

export type { TableOptions }
