import { FC } from 'react'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import { Editable } from '../plugin/editable'

export interface SlotStore {
  components: FC[]
}

const EDITOR_TO_SLOTS_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<SlotStore>>>()

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_SLOTS_STORE.get(editor)
  if (!store) {
    store = create<SlotStore>(() => ({
      components: [],
    }))
    EDITOR_TO_SLOTS_STORE.set(editor, store)
  }
  return store
}

export const useSlots = (editor: Editable) => {
  const store = getStore(editor)
  return useStore(store, state => state.components)
}

export const Slots = {
  add(editor: Editable, component: FC) {
    const store = getStore(editor)
    store.setState(state => {
      const { components } = state
      if (components.includes(component)) return state
      return {
        components: [...components, component],
      }
    })
  },
  remove(editor: Editable, component: FC) {
    const store = getStore(editor)
    store.setState(state => {
      const { components } = state
      if (!components.includes(component)) return state
      return {
        components: components.filter(c => c !== component),
      }
    })
  },
}
