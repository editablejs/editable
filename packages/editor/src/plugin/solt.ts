import merge from 'lodash.merge'
import { FC } from 'react'
import create, { StoreApi, UseBoundStore } from 'zustand'
import { Editable } from '../plugin/editable'

export interface SlotComponentProps {
  active?: boolean
}

export interface SlotState<T extends SlotComponentProps> {
  component: FC
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
    component: FC<T>,
    props: T = { active: true } as T,
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

  unmount(editor: Editable, component: FC) {
    const store = getStore(editor)
    store.setState(state => {
      const { components } = state
      if (!components.some(c => c.component === component)) return state
      return {
        components: components.filter(c => c.component !== component),
      }
    })
  },

  update: <T extends SlotComponentProps>(editor: Editable, component: FC<T>, props: Partial<T>) => {
    const store = getStore(editor)
    store.setState(state => {
      const { components } = state
      if (!components.some(({ component }) => component === component)) return state
      return {
        components: components.map(c => {
          if (c.component !== component) return c
          return { ...c, props: merge(c.props, props) }
        }),
      }
    })
  },

  disable: (editor: Editable, filter: (component: FC) => boolean) => {
    const store = getStore(editor)
    const { components } = store.getState()
    components.forEach(({ component, props }) => {
      if (props.active && filter(component)) {
        Slot.update(editor, component, { active: false })
      }
    })
  },

  enable: (editor: Editable, filter: (component: FC) => boolean) => {
    const store = getStore(editor)
    const { components } = store.getState()
    components.forEach(({ component, props }) => {
      if (!props.active && filter(component)) Slot.update(editor, component, { active: true })
    })
  },
}
