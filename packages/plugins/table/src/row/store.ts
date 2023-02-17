import { useIsomorphicLayoutEffect } from '@editablejs/editor'
import { GridRow } from '@editablejs/models'
import { useCallback, useEffect, useState } from 'react'
import create, { StoreApi, UseBoundStore } from 'zustand'

const ROW_STORE_WEAK_MAP = new WeakMap<GridRow, UseBoundStore<StoreApi<TableRowStore>>>()

export interface TableRowStore {
  contentHeight: number
}

export const getRowStore = (element: GridRow) => {
  let store = ROW_STORE_WEAK_MAP.get(element)
  if (!store) {
    store = create<TableRowStore>(() => ({
      contentHeight: element.height ?? 0,
    }))
    ROW_STORE_WEAK_MAP.set(element, store)
  }
  return store
}

export const useRowStore = (element: GridRow) => {
  const store = getRowStore(element)
  useEffect(() => {
    return () => {
      ROW_STORE_WEAK_MAP.get(element)?.destroy()
      ROW_STORE_WEAK_MAP.delete(element)
    }
  }, [element])
  return store
}

export const useRowContentHeight = (element: GridRow) => {
  const store = useRowStore(element)
  const state = store.getState()
  return [
    state.contentHeight,
    (height: number) => {
      store.setState({ contentHeight: height })
    },
  ] as const
}

export const useTableRowContentHeights = (rows: GridRow[]) => {
  const refresh = useCallback(() => {
    return rows.map(row => {
      const store = getRowStore(row)
      return store.getState().contentHeight || row.height || 0
    })
  }, [rows])

  const [heights, setHeights] = useState<number[]>(refresh)
  useIsomorphicLayoutEffect(() => {
    setHeights(refresh())
  }, [refresh])

  return heights
}

export const RowStore = {
  getStore: getRowStore,
  getContentHeight: (element: GridRow) => {
    const store = getRowStore(element)
    return store.getState().contentHeight
  },
  setContentHeight: (element: GridRow, height: number) => {
    const store = getRowStore(element)
    store.setState({ contentHeight: height })
  },
}
