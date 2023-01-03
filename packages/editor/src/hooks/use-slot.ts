import React from 'react'
import { useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { Slot } from '../plugin/solt'
import { useEditableStatic } from './use-editable'

export const useSlotStore = () => {
  const editor = useEditableStatic()
  return React.useMemo(() => Slot.getStore(editor), [editor])
}

export const useSlotComponents = () => {
  const store = useSlotStore()
  return useStore(store, state => state.components, shallow)
}

export const useSlotActive = (component: React.FC) => {
  const components = useSlotComponents()
  const editor = useEditableStatic()
  const slot = components.find(c => c.component === component)
  return React.useMemo(() => {
    return [
      slot?.props.active ?? false,
      (active: boolean) => {
        Slot.update(editor, { active }, c => c === component)
      },
    ] as const
  }, [editor, slot, component])
}
