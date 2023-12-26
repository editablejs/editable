import { shallow } from 'rezon-store/shallow'
import { useStoreWithEqualityFn } from 'rezon-store/use-store-with-equality-fn'
import { Slot } from '../plugin/solt'
import { useEditableStatic } from './use-editable'
import { useMemo, Component } from 'rezon'

export const useSlotStore = () => {
  const editor = useEditableStatic()
  return useMemo(() => Slot.getStore(editor), [editor])
}

export const useSlotComponents = () => {
  const store = useSlotStore()
  return useStoreWithEqualityFn(store, state => state.components, shallow)
}

export const useSlotActive = (component: Component) => {
  const components = useSlotComponents()
  const editor = useEditableStatic()
  const slot = components.find(c => c.component === component)
  return useMemo(() => {
    return [
      slot?.props.active ?? false,
      (active: boolean) => {
        Slot.update(editor, { active }, c => c === component)
      },
    ] as const
  }, [editor, slot, component])
}
