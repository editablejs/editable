import merge from 'lodash.merge'
import * as React from 'react'
import create, { StoreApi, UseBoundStore } from 'zustand'
import { Editor } from '@editablejs/models'

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
  Editor,
  UseBoundStore<StoreApi<SlotStore<SlotComponentProps>>>
>()

const getStore = (editor: Editor) => {
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

  mount<T extends SlotComponentProps>(editor: Editor, component: React.FC<T>, props: T = {} as T) {
    const store = getStore(editor)
    store.setState(state => {
      const { components } = state
      if (components.some(c => c.component === component)) return state
      return {
        components: [...components, { component, props } as SlotState<T>],
      }
    })
  },

  unmount(editor: Editor, component: React.FC) {
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
    editor: Editor,
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
