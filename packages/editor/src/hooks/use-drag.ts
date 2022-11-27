import { useCallback, useMemo } from 'react'
import { useEditableStatic } from './use-editable-static'
import { Drag, DragStore } from '../plugin/drag'
import { useStore } from 'zustand'

export const useDragStore = () => {
  const editor = useEditableStatic()
  const store = useMemo(() => {
    return Drag.getStore(editor)
  }, [editor])
  return store
}

/**
 * 是否拖拽中
 * @returns
 */
export const useDragging = () => {
  const store = useDragStore()

  const drag = useStore(store, state => state.drag !== null)

  return useMemo(() => drag, [drag])
}

export const useDragType = () => {
  const store = useDragStore()

  const type = useStore(store, state => state.drag?.type ?? null)

  return useMemo(() => type, [type])
}

/**
 * 拖拽到的目标
 * @returns
 */
export const useDragTo = () => {
  const store = useDragStore()
  const drag = useStore(store, state => state.drag)

  return useMemo(() => drag?.to ?? null, [drag])
}

/**
 * 当前拖拽的鼠标位置
 * @returns
 */
export const useDragPosition = () => {
  const store = useDragStore()
  const drag = useStore(store, state => state.drag)

  return useMemo(() => drag?.position ?? null, [drag])
}

/**
 * 当前拖拽的数据
 * @returns
 */
export const useDragData = () => {
  const store = useDragStore()
  const drag = useStore(store, state => state.drag)

  return useMemo(() => drag?.data ?? 0, [drag])
}

export const useDragMethods = () => {
  const editor = useEditableStatic()

  const setDrag = useCallback(
    (drag: Partial<DragStore['drag']>) => {
      Drag.setDrag(editor, drag)
    },
    [editor],
  )

  const getDrag = useCallback(() => {
    return Drag.getDrag(editor)
  }, [editor])

  return useMemo(() => ({ setDrag, getDrag }), [setDrag, getDrag])
}
