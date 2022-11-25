import { useMemo } from 'react'
import create, { useStore } from 'zustand'
import { Range } from 'slate'

export interface DragStore {
  drag: {
    /**
     * 拖拽的开始位置
     */
    from: Range
    /**
     * 拖拽到目标位置
     */
    to: Range | null
    /**
     * 拖拽的数据
     */
    data: DataTransfer
    /**
     * 当前鼠标位置
     */
    point: Record<'x' | 'y', number>
  } | null
}

/**
 * 拖拽状态
 */
const store = create<DragStore>(() => ({
  drag: null,
}))

/**
 * 是否拖拽中
 * @returns
 */
export const useDragging = () => {
  const drag = useStore(store, state => state.drag !== null)

  return useMemo(() => drag, [drag])
}

/**
 * 拖拽到的目标
 * @returns
 */
export const useDragTo = () => {
  const drag = useStore(store, state => state.drag)

  return useMemo(() => drag?.to ?? null, [drag])
}

/**
 * 当前拖拽的鼠标位置
 * @returns
 */
export const useDragPoint = () => {
  const drag = useStore(store, state => state.drag)

  return useMemo(() => drag?.point ?? null, [drag])
}

/**
 * 当前拖拽的数据
 * @returns
 */
export const useDragData = () => {
  const drag = useStore(store, state => state.drag)

  return useMemo(() => drag?.data ?? 0, [drag])
}

/**
 * 拖拽相关状态操作
 */
export const Drag = {
  /**
   * 当前是否拖拽中
   * @returns
   */
  isDragging: () => {
    const { drag } = store.getState()
    return drag !== null
  },
  /**
   * 获取当前拖拽中的状态
   * @returns
   */
  getDrag: () => {
    const { drag } = store.getState()
    if (!drag) throw new Error('not drag')
    return drag
  },
  /**
   * 获取当前拖拽的数据
   * @returns
   */
  getDragData: () => {
    const { drag } = store.getState()
    if (!drag) return null
    return drag.data
  },
  /**
   * 开始一个拖拽
   * @param type
   * @param from
   */
  setFrom: (from: Range, data: DataTransfer, point: Record<'x' | 'y', number>) => {
    store.setState({ drag: { data, from, point, to: null } })
  },
  /**
   * 设置拖拽的目标位置
   * @param to
   * @returns
   */
  setTo: (to: Range) => {
    const { drag } = store.getState()
    if (!drag) return
    store.setState(() => {
      return {
        drag: { ...drag, to: Range.includes(drag.from, to) ? null : to },
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
