import { useStore } from 'zustand'
import { useEditableStore } from './use-editable'

export const useReadOnly = (): boolean => {
  const store = useEditableStore()
  return useStore(store, state => state.readOnly)
}
