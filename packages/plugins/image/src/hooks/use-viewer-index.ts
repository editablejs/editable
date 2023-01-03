import { useMemo } from 'react'
import { useStore } from 'zustand'
import { useViewerStore } from './use-viewer-store'

export const useViewerIndex = (): [number, (index: number) => void] => {
  const store = useViewerStore()
  const index = useStore(store, state => state.index)
  return useMemo(() => [index, (index: number) => store.setState({ index })], [store, index])
}
