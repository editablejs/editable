import { ReactNode } from 'react'
import { Node, NodeEntry } from 'slate'
import create, { UseBoundStore, StoreApi } from 'zustand'
import { Editable } from './editable'

export interface RenderPlaceholderProps {
  node: Node
}
export type PlaceholderRender = (props: RenderPlaceholderProps) => ReactNode

export interface PlaceholderState {
  key?: string
  check: (entry: NodeEntry) => boolean
  render: PlaceholderRender
}

export interface PlaceholderStore {
  placeholders: PlaceholderState[]
  current: {
    node: Node
    render: PlaceholderRender
  } | null
}

const EDITOR_TO_PLACEHOLDER_STORE = new WeakMap<
  Editable,
  UseBoundStore<StoreApi<PlaceholderStore>>
>()

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_PLACEHOLDER_STORE.get(editor)
  if (!store) {
    store = create<PlaceholderStore>(() => ({
      placeholders: [],
      current: null,
    }))
    EDITOR_TO_PLACEHOLDER_STORE.set(editor, store)
  }
  return store
}

export const Placeholder = {
  getStore,

  add: (editor: Editable, placeholder: PlaceholderState) => {
    const store = getStore(editor)
    store.setState(state => ({
      placeholders: [...state.placeholders, placeholder],
    }))
  },

  remove: (editor: Editable, placeholder: PlaceholderState | string) => {
    const store = getStore(editor)
    const isKey = typeof placeholder === 'string'
    store.setState(state => ({
      placeholders: state.placeholders.filter(d =>
        isKey ? d.key !== placeholder : d !== placeholder,
      ),
    }))
  },

  setCurrent: (editor: Editable, entry: NodeEntry) => {
    const store = getStore(editor)
    return store.setState(state => {
      const current = state.placeholders.find(p => p.check(entry))
      return {
        current: current ? { node: entry[0], render: current.render } : null,
      }
    })
  },

  clearCurrent: (editor: Editable) => {
    const store = getStore(editor)
    return store.setState(() => {
      return {
        current: null,
      }
    })
  },
}
