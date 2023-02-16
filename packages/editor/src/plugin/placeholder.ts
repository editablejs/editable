import * as React from 'react'
import { Editor, Node, NodeEntry } from '@editablejs/models'
import create, { UseBoundStore, StoreApi } from 'zustand'
import { Editable } from './editable'

export interface RenderPlaceholderProps {
  node: Node
}
export type PlaceholderRender = (props: RenderPlaceholderProps) => React.ReactNode

export interface PlaceholderState {
  key?: string
  keep?: boolean
  check: (entry: NodeEntry) => boolean
  render: PlaceholderRender
}

export interface ActivePlaceholder {
  node: Node
  keep: boolean
  render: PlaceholderRender
}

export interface PlaceholderStore {
  placeholders: PlaceholderState[]
  activePlaceholders: ActivePlaceholder[]
}

const EDITOR_TO_PLACEHOLDER_STORE = new WeakMap<
  Editable,
  UseBoundStore<StoreApi<PlaceholderStore>>
>()

const getPlaceholderStore = (editor: Editable) => {
  let store = EDITOR_TO_PLACEHOLDER_STORE.get(editor)
  if (!store) {
    store = create<PlaceholderStore>(() => ({
      placeholders: [],
      activePlaceholders: [],
    }))
    EDITOR_TO_PLACEHOLDER_STORE.set(editor, store)
  }
  return store
}

export const Placeholder = {
  getStore: getPlaceholderStore,

  add: (editor: Editable, placeholder: PlaceholderState) => {
    const store = getPlaceholderStore(editor)
    store.setState(state => ({
      placeholders: [...state.placeholders, placeholder],
    }))
  },

  remove: (editor: Editable, placeholder: PlaceholderState | string) => {
    const store = getPlaceholderStore(editor)
    const isKey = typeof placeholder === 'string'
    store.setState(state => ({
      placeholders: state.placeholders.filter(d =>
        isKey ? d.key !== placeholder : d !== placeholder,
      ),
    }))
  },

  update: (editor: Editable, entry: NodeEntry) => {
    const store = getPlaceholderStore(editor)
    return store.setState(state => {
      const placeholder = state.placeholders.find(p => p.check(entry))
      if (!placeholder) return state

      const activePlaceholders = state.activePlaceholders.filter(p => p.node !== entry[0] || p.keep)
      activePlaceholders.push({
        node: entry[0],
        keep: placeholder.keep ?? false,
        render: placeholder.render,
      })
      return {
        activePlaceholders,
      }
    })
  },

  updateActive: (editor: Editable) => {
    const store = getPlaceholderStore(editor)
    return store.setState(state => {
      const activePlaceholders = []
      for (const placeholder of state.activePlaceholders) {
        if (placeholder.keep && Editor.isEmpty(editor, placeholder.node)) {
          activePlaceholders.push(placeholder)
        }
      }
      return {
        activePlaceholders:
          activePlaceholders.length === state.activePlaceholders.length
            ? state.activePlaceholders
            : activePlaceholders,
      }
    })
  },
}
