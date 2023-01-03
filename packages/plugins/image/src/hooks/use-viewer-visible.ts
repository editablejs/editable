import { useMemo } from 'react'
import { useStore } from 'zustand'
import { useViewerStore } from './use-viewer-store'

export const useViewerVisible = (): [boolean, (visible: boolean) => void] => {
  const store = useViewerStore()
  const visible = useStore(store, state => state.visible)
  return useMemo(() => {
    return [visible, (visible: boolean) => store.setState({ visible })]
  }, [store, visible])
}
