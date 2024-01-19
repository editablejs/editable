import { Editable, Slot, cancellablePromise, useCancellablePromises } from '@editablejs/editor'
import { Editor, Grid, Transforms } from '@editablejs/models'
import { Icon } from '@editablejs/ui'
import * as React from 'react'
import { TABLE_CELL_KEY } from '../cell/constants'
import { defaultTableMinColWidth } from '../cell/options'
import { TableDrag, useTableDragTo, useTableDragging } from '../hooks/use-drag'
import { TableRow } from '../row'
import { TABLE_ROW_KEY } from '../row/constants'
import { defaultTableMinRowHeight } from '../row/options'
import { RowStore } from '../row/store'
import { useTableOptions } from '../table/options'
import { adaptiveExpandColumnWidthInContainer } from '../table/utils'
import {
  ColsInsertIconStyles,
  ColsInsertLineStyles,
  ColsInsertPlusStyles,
  ColsInsertStyles,
  ColsSplitLineStyles,
  ColsSplitStyles,
  RowsInsertIconStyles,
  RowsInsertLineStyles,
  RowsInsertPlusStyles,
  RowsInsertStyles,
  RowsSplitLineStyles,
  RowsSplitStyles,
} from './styles'

const TYPE_COL = 'col'
const TYPE_ROW = 'row'

export interface TableActionProps {
  editor: Editor
  table: Grid
  index: number
  left?: number
  top?: number
  height?: number
  width?: number
}

// insert action
const InsertActionDefault: React.FC<TableActionProps> = ({
  editor,
  table,
  left,
  top,
  height,
  width,
  index,
}) => {
  if (left !== undefined) {
    left -= 1
  }
  if (top !== undefined) {
    top -= 1
  }

  if (height !== undefined) {
    height += 11
  }
  if (width !== undefined) {
    width += 11
  }

  const type = left !== undefined ? TYPE_COL : TYPE_ROW

  const { minColWidth = defaultTableMinColWidth, minRowHeight = defaultTableMinRowHeight } =
    useTableOptions(editor)

  const draggingTo = useTableDragTo()

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault()
    if (type === TYPE_COL) {
      let colWidth = minColWidth
      const { colsWidth } = table
      if (colsWidth) {
        if (index >= colsWidth.length) colWidth = colsWidth[colsWidth.length - 1]
        else {
          colWidth = colsWidth[index]
        }
      }
      const path = Editable.findPath(editor, table)
      Grid.insertCol(editor, path, index, { type: TABLE_CELL_KEY }, colWidth, minColWidth)
      const newGrid = Grid.above(editor, path)
      if (newGrid && newGrid[0].colsWidth) {
        const newColsWidth = adaptiveExpandColumnWidthInContainer(editor, newGrid[0].colsWidth)
        Transforms.setNodes<Grid>(editor, { colsWidth: newColsWidth }, { at: path })
      }
    } else if (type === TYPE_ROW) {
      Grid.insertRow(
        editor,
        Editable.findPath(editor, table),
        index,
        { type: TABLE_ROW_KEY },
        { type: TABLE_CELL_KEY },
        minRowHeight,
      )
    }
  }

  const draggingActive = React.useMemo(() => {
    return draggingTo > -1 && draggingTo === index && TableDrag.getDrag().type === type
  }, [draggingTo, index, type])

  const InsertStyles = type === TYPE_COL ? ColsInsertStyles : RowsInsertStyles
  const InsertIconStyles = type === TYPE_COL ? ColsInsertIconStyles : RowsInsertIconStyles
  const InsertLineStyles = type === TYPE_COL ? ColsInsertLineStyles : RowsInsertLineStyles
  const InsertPlusStyles = type === TYPE_COL ? ColsInsertPlusStyles : RowsInsertPlusStyles
  return (
    <InsertStyles isActive={draggingActive} style={{ left, top }} onMouseDown={handleMouseDown}>
      <InsertIconStyles>
        <svg width="3" height="3" viewBox="0 0 3 3" fill="none">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#BBBFC4"></circle>
        </svg>
      </InsertIconStyles>
      {!draggingActive && (
        <InsertPlusStyles>
          <Icon name="plusCircle" />
        </InsertPlusStyles>
      )}
      <InsertLineStyles isActive={draggingActive} style={{ height, width }}></InsertLineStyles>
    </InsertStyles>
  )
}

export const InsertAction = React.memo(InsertActionDefault, (prev, next) => {
  const { editor, table } = prev
  const { editor: nextEditor, table: nextTable } = next
  return (
    editor === nextEditor &&
    table === nextTable &&
    prev.index === next.index &&
    prev.left === next.left &&
    prev.top === next.top &&
    prev.height === next.height &&
    prev.width === next.width
  )
})

interface TableDragSplitOptions {
  type: typeof TYPE_COL | typeof TYPE_ROW
  x: number
  y: number
  start: number
  end: number
}
// split action
const SplitActionDefault: React.FC<TableActionProps> = ({
  editor,
  table,
  left,
  top,
  height,
  width,
  index,
}) => {
  if (height !== undefined) {
    height += 8
  }
  if (width !== undefined) {
    width += 8
  }
  // 宽/高度为3，所以得减1居中
  if (left !== undefined) {
    left -= 1
  }
  if (top !== undefined) {
    top -= 1
  }
  const type = left !== undefined ? TYPE_COL : TYPE_ROW

  const dragRef = React.useRef<TableDragSplitOptions | null>(null)
  const { minColWidth = defaultTableMinColWidth, minRowHeight = defaultTableMinRowHeight } =
    useTableOptions(editor)
  const [isHover, setHover] = React.useState(false)
  const isDrag = React.useRef(false)

  const handleDragSplitMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current) return
      const { type, x, y, start } = dragRef.current
      const path = Editable.findPath(editor, table)
      if (type === TYPE_COL) {
        const { colsWidth } = table
        if (!colsWidth) return
        const cX = e.clientX
        const val = cX - x
        const newColsWidth = colsWidth.concat()
        let width = newColsWidth[start] + val
        width = Math.max(width, minColWidth)
        if (start < newColsWidth.length - 1) {
          width = Math.min(newColsWidth[start] + newColsWidth[start + 1] - minColWidth, width)
          let nextW = newColsWidth[start + 1] - val
          nextW = Math.max(nextW, minColWidth)
          nextW = Math.min(newColsWidth[start] + newColsWidth[start + 1] - minColWidth, nextW)
          newColsWidth[start + 1] = nextW
        }
        newColsWidth[start] = width
        Transforms.setNodes<Grid>(editor, { colsWidth: newColsWidth }, { at: path })
        // // 这里需要循环遍历每一列的高度RowStore.getContentHeight(row)，并重新更新列高度 RowStore.setContentHeight(row, contentHeight) 和Transforms.setNodes<TableRow>(editor, { height: h }, { at: path.concat(start) })
        // const newGrid = Grid.above(editor, path)
        // if (!newGrid) return
        // const { children: rows } = newGrid[0]
        // let contentHeight = 0
        // for (let i = 0; i < rows.length; i++) {
        //   const row = rows[i]
        //   const ch = RowStore.getContentHeight(row)
        //   const child = Editable.toDOMNode(editor, row).firstElementChild
        //   if (!child) continue
        //   const rect = child.getBoundingClientRect()
        //   contentHeight = Math.max(contentHeight, rect.height + 2, minRowHeight)
        //   if (ch !== contentHeight) {
        //     RowStore.setContentHeight(row, contentHeight)
        //     Transforms.setNodes<TableRow>(editor, { height: contentHeight }, { at: path.concat(i) })
        //   }
        // }
      } else if (type === TYPE_ROW) {
        const row = table.children[start]
        const { height, children: cells } = row
        if (height) {
          const ch = RowStore.getContentHeight(row)
          const cY = e.clientY
          const val = cY - y
          let h = Math.max(height, ch!) + val
          h = Math.max(h, minRowHeight)
          let contentHeight = 0
          for (let i = 0; i < cells.length; i++) {
            const child = Editable.toDOMNode(editor, cells[i]).firstElementChild
            if (!child) continue
            const rect = child.getBoundingClientRect()
            contentHeight = Math.max(contentHeight, rect.height + 2, minRowHeight)
          }
          if (h < contentHeight) {
            h = contentHeight
          }
          RowStore.setContentHeight(row, contentHeight)
          Transforms.setNodes<TableRow>(editor, { height: h }, { at: path.concat(start) })
        }
      }
    },
    [editor, minColWidth, minRowHeight, table],
  )

  const cancellablePromisesApi = useCancellablePromises()

  const handleDragSplitUp = React.useCallback(() => {
    if (!dragRef.current) return;
    const { type: type2 } = dragRef.current;
    const path = Editable.findPath(editor, table);

    if (type2 === TYPE_COL) {
      const newGrid = Grid.above(editor, path);
      if (!newGrid) return;
      const { children: rows } = newGrid[0];
      let contentHeight = 0;
      const heightArray: number[] = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const trRow = Editable.toDOMNode(editor, row);
        // 2024/01/19 10:40:43 @guoxiaona/GW00234847：遍历trRow,判断所有子元素中rowSpan为1且colSpan为1，且style中的display不为none的子元素
        const trRowChildrenArray = Array.from(trRow.children);
        let child: any = null;
        trRowChildrenArray.forEach((item: any) => {
          const rowspan = item.rowSpan;
          const colspan = item.colSpan;
          const style = item.style;
          const display = style.display;
          if (rowspan === 1 && colspan === 1 && display !== "none") {
            child = item;
          }
        });
        if (!child) continue;
        const rect = child.getBoundingClientRect();
        contentHeight = Math.max(rect.height, minRowHeight);
        heightArray.push(contentHeight);
      }
      // 2024/01/19 10:41:10 @guoxiaona/GW00234847：heightArray中当前数之前所有数值的和
      const heightArrayMapOnlyPrev = heightArray.map((item, index) => {
        let sum = 0;
        for (let i = 0; i < index; i++) {
          sum += heightArray[i];
        }
        return sum;
      });
      // 2024/01/19 10:41:27 @guoxiaona/GW00234847：heightArray中当前数和之前所有数值的和
      const heightArrayMapAllPrev = heightArray.map((item, index) => {
        let sum = 0;
        for (let i = 0; i <= index; i++) {
          sum += heightArray[i];
        }
        return sum;
      });

      const cld = Editable.toDOMNode(editor, rows[0]).firstElementChild;

      // 2024/01/19 10:41:43 @guoxiaona/GW00234847：获取child的祖先节点table所在的节点的父节点的第二个子节点
      const t = cld?.closest("table");
      const tableParent = t?.parentElement;
      const tableParentChildrenArray = Array.from(tableParent!.children);
      const tableTopBorder = tableParentChildrenArray?.[0];
      const tableLeftBorder = tableParentChildrenArray?.[1];
      // 2024/01/19 10:42:07 @guoxiaona/GW00234847：获取tableLeftBorder中所有子元素带有属性data-table-row的，并按照该属性值放到一个数组中borderHeightArray
      const borderHeightArray: number[] = [];
      const tableLeftBorderChildrenArray = Array.from(
        tableLeftBorder?.children
      );
      const tableLeftBorderPerRowArray: any[] = [];
      tableLeftBorderChildrenArray.forEach((item: any) => {
        if (item.dataset.tableRow) {
          tableLeftBorderPerRowArray.push(item);
          // 2024/01/19 10:42:28 @guoxiaona/GW00234847：需要从item中获取当前style中的height值，并放入borderHeightArray中
          const style = item.style;
          const height = Number(style.height.replace("px", ""));
          borderHeightArray.push(height);
        }
      });
      // 2024/01/19 10:42:47 @guoxiaona/GW00234847：检测heightArray和borderHeightArray对应下标的数值相差是否在5以内，如果是，则不做任何处理，否则更新当前行对应的高度
      let ifRowHeightUpdated = false;
      heightArray.forEach((item, index) => {
        const borderHeight = borderHeightArray[index];
        const itemNumber = Number(item);
        const diff = Math.abs(borderHeight - itemNumber);
        // 2024/01/19 10:43:20 @guoxiaona/GW00234847：在这里更新当前行及后面行的高度及top值
        if (diff > 10 || ifRowHeightUpdated) {
          ifRowHeightUpdated = true;
          // 2024/01/19 10:43:33 @guoxiaona/GW00234847：调整当前tableLeftBorderPerRowArray[index]的高度为heightArray[index] + 1,top为heightArrayMapOnlyPrev[index]
          const currentRow = tableLeftBorderPerRowArray[index];
          const currentRowStyle = currentRow.style;
          currentRowStyle.height = `${itemNumber + 1}px`;
          currentRowStyle.top = `${heightArrayMapOnlyPrev[index]}px`;
          // 2024/01/19 10:43:47 @guoxiaona/GW00234847：调整当前tableLeftBorderPerRowArray[index]后面两个兄弟元素的top值为heightArrayMapAllPrev[index] - 1
          // 2024/01/19 10:44:00 @guoxiaona/GW00234847：需要重新获取后面两个兄弟元素，这两个兄弟元素没在tableLeftBorderPerRowArray[index]里
          const nextSibling = currentRow.nextElementSibling;
          const nextSiblingStyle = nextSibling.style;
          nextSiblingStyle.top = `${heightArrayMapAllPrev[index] - 1}px`;
          const nextNextSibling = nextSibling.nextElementSibling;
          const nextNextSiblingStyle = nextNextSibling.style;
          nextNextSiblingStyle.top = `${heightArrayMapAllPrev[index] - 1}px`;
        }
      });
      // 2024/01/19 10:44:13 @guoxiaona/GW00234847：如果行高调整过，则需要对应调整列的高度为heightArrayMapAllPrev的最后一个元素的值 + 9
      if (ifRowHeightUpdated) {
        // 2024/01/19 10:44:25 @guoxiaona/GW00234847：获取tableTopBorder中所有子元素带有属性data-table-col的子元素，并放到一个数组中tableTopBorderPerColArray
        const tableTopBorderChildrenArray = Array.from(
          tableTopBorder?.children
        );
        const tableTopBorderPerColArray: any[] = [];
        tableTopBorderChildrenArray.forEach((item: any) => {
          if (item.dataset.tableCol) {
            tableTopBorderPerColArray.push(item);
          }
        });
        // 2024/01/19 10:44:46 @guoxiaona/GW00234847：遍历tableTopBorderPerColArray中每一个元素的兄弟节点的兄弟节点，找到后，将高度调整为heightArrayMapAllPrev的最后一个元素的值 + 9
        tableTopBorderPerColArray.forEach((item) => {
          const nextNextSibling = item.nextElementSibling.nextElementSibling;
          const nextNextSiblingStyle = nextNextSibling.style;
          nextNextSiblingStyle.height = `${
            heightArrayMapAllPrev[heightArrayMapAllPrev.length - 1] + 16
          }px`;
        });
      }
    }

    dragRef.current = null
    isDrag.current = false
    setHover(false)
    cancellablePromisesApi.clearPendingPromises()
    window.removeEventListener('mousemove', handleDragSplitMove)
    window.removeEventListener('mouseup', handleDragSplitUp)
  }, [cancellablePromisesApi, dragRef, handleDragSplitMove])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = {
      type,
      x: e.clientX,
      y: e.clientY,
      start: index,
      end: index,
    }
    isDrag.current = true
    setHover(true)
    window.addEventListener('mousemove', handleDragSplitMove)
    window.addEventListener('mouseup', handleDragSplitUp)
  }

  const draging = useTableDragging()

  React.useEffect(() => {
    if (draging) Slot.update(editor, { active: false })
  }, [draging, editor])
  const handleMouseOver = React.useCallback(() => {
    if (draging) return
    cancellablePromisesApi.clearPendingPromises()
    const wait = cancellablePromise(cancellablePromisesApi.delay(200))
    cancellablePromisesApi.appendPendingPromise(wait)
    wait.promise
      .then(() => {
        setHover(true)
      })
      .catch(err => {})
  }, [cancellablePromisesApi, draging])

  const handleMouseLeave = React.useCallback(() => {
    if (isDrag.current) return
    cancellablePromisesApi.clearPendingPromises()
    setHover(false)
  }, [cancellablePromisesApi])

  const SplitStyles = type === TYPE_COL ? ColsSplitStyles : RowsSplitStyles
  const SplitLineStyles = type === TYPE_COL ? ColsSplitLineStyles : RowsSplitLineStyles
  if (draging) return null
  return (
    <SplitStyles
      isHover={isHover && !draging}
      style={{ left, top, height, width }}
      onMouseDown={handleMouseDown}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <SplitLineStyles isHover={isHover && !draging} />
    </SplitStyles>
  )
}

export const SplitAction = React.memo(SplitActionDefault, (prev, next) => {
  const { editor, table } = prev
  const { editor: nextEditor, table: nextTable } = next
  return (
    editor === nextEditor &&
    table === nextTable &&
    prev.index === next.index &&
    prev.left === next.left &&
    prev.top === next.top &&
    prev.height === next.height &&
    prev.width === next.width
  )
})
