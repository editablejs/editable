import * as React from 'react'
import create, { useStore } from 'zustand'

export interface TableDragStore {
  drag: {
    /**
     * 拖拽类型，行 或者 列
     */
    type: 'row' | 'col'
    /**
     * 拖拽的行或者列的索引
     */
    from: number[]
    /**
     * 拖拽到目标的行或者列的索引
     */
    to: number
    /**
     * 当前鼠标位置
     */
    point: Record<'x' | 'y', number>
  } | null
}

/**
 * 表格拖拽状态
 */
const store = create<TableDragStore>(() => ({
  drag: null,
}))

/**
 * 表格是否拖拽中
 * @returns
 */
export const useTableDragging = () => {
  const drag = useStore(store, state => state.drag !== null)

  return React.useMemo(() => drag, [drag])
}

/**
 * 拖拽到目标位置的行或者列的索引
 * @returns
 */
export const useTableDragTo = () => {
  const drag = useStore(store, state => state.drag)

  return React.useMemo(() => drag?.to ?? -1, [drag])
}

/**
 * 当前拖拽的鼠标位置
 * @returns
 */
export const useTableDragPoint = () => {
  const drag = useStore(store, state => state.drag)

  return React.useMemo(() => drag?.point ?? null, [drag])
}

/**
 * 当前拖拽的行数或列数
 * @returns
 */
export const useTableDragCount = () => {
  const drag = useStore(store, state => state.drag)

  return React.useMemo(() => drag?.from.length ?? 0, [drag])
}

/**
 * 表格拖拽相关状态操作
 */
export const TableDrag = {
  /**
   * 当前是否拖拽中
   * @returns
   */
  isDragging: () => {
    const { drag } = store.getState()
    return drag !== null
  },
  /**
   * 获取当前拖拽中的数据
   * @returns
   */
  getDrag: () => {
    const { drag } = store.getState()
    if (!drag) throw new Error('not drag')
    return drag
  },
  /**
   * 获取当前拖拽的类型
   * @returns
   */
  getDragType: () => {
    const { drag } = store.getState()
    if (!drag) return null
    return drag.type
  },
  /**
   * 开始一个拖拽
   * @param type
   * @param from
   */
  setFrom: (type: 'row' | 'col', from: number[], point: Record<'x' | 'y', number>) => {
    store.setState({ drag: { type, from, point, to: -1 } })
  },
  /**
   * 设置拖拽的目标位置
   * @param to
   * @returns
   */
  setTo: (to: number) => {
    const { drag } = store.getState()
    if (!drag) return
    store.setState(() => {
      const max = Math.max(...drag.from)
      return {
        drag: { ...drag, to: ~drag.from.concat(max + 1).indexOf(to) ? -1 : to },
      }
    })
  },
  /**
   * 设置当前鼠标位置·
   * @param point
   * @returns
   */
  setPoint: (point: Record<'x' | 'y', number>) => {
    const { drag } = store.getState()
    if (!drag) return
    store.setState({ drag: { ...drag, point } })
  },
  /**
   * 结束拖拽
   */
  clear: () => {
    store.setState({ drag: null })
  },
}
