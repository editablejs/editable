import { useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { Editable } from '../plugin/editable'
import { Slot } from '../plugin/solt'

export const useSlotComponents = (editor: Editable) => {
  const store = Slot.getStore(editor)
  return useStore(store, state => state.components, shallow)
}
