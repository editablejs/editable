import merge from 'lodash.merge'
import * as React from 'react'
import create, { StoreApi, UseBoundStore } from 'zustand'
import { Editable } from '../plugin/editable'

export interface SlotComponentProps {
  active?: boolean
}

export interface SlotState<T extends SlotComponentProps> {
  component: React.FC
  props: T
}

export interface SlotStore<T extends SlotComponentProps> {
  components: SlotState<T>[]
}

const EDITOR_TO_SLOTS_STORE = new WeakMap<
  Editable,
  UseBoundStore<StoreApi<SlotStore<SlotComponentProps>>>
>()

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_SLOTS_STORE.get(editor)
  if (!store) {
    store = create<SlotStore<SlotComponentProps>>(() => ({
      components: [],
    }))
    EDITOR_TO_SLOTS_STORE.set(editor, store)
  }
  return store
}

export const Slot = {
  getStore,

  mount<T extends SlotComponentProps>(
    editor: Editable,
    component: React.FC<T>,
    props: T = {} as T,
  ) {
    const store = getStore(editor)
    store.setState(state => {
      const { components } = state
      if (components.some(c => c.component === component)) return state
      return {
        components: [...components, { component, props } as SlotState<T>],
      }
    })
  },

  unmount(editor: Editable, component: React.FC) {
    const store = getStore(editor)
    store.setState(state => {
      const { components } = state
      if (!components.some(c => c.component === component)) return state
      return {
        components: components.filter(c => c.component !== component),
      }
    })
  },

  update: <T extends SlotComponentProps>(
    editor: Editable,
    props: Partial<T>,
    predicate: (value: React.FC<T>, index: number) => boolean = () => true,
  ) => {
    const store = getStore(editor)
    store.setState(state => {
      const { components } = state
      return {
        components: components.map((c, index) => {
          if (!predicate(c.component, index)) return c
          return { ...c, props: merge(c.props, props) }
        }),
      }
    })
  },
}
