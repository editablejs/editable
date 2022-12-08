import * as React from 'react'
import { NodeEntry, Range, Element, Text } from 'slate'
import create, { StoreApi, UseBoundStore } from 'zustand'
import { Editable } from './editable'

export type DecorateType = 'element' | 'text'

export interface DecorateRenderProps {
  entry: NodeEntry
  ranges: Range[]
  children: React.ReactNode
}

export interface Decorate {
  key?: string
  type: DecorateType
  decorate: (entry: NodeEntry) => Range[]
  render: (props: DecorateRenderProps) => JSX.Element
}

export interface DecorateStore {
  decorates: Decorate[]
}

const EDITOR_TO_DECORATE_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<DecorateStore>>>()

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_DECORATE_STORE.get(editor)
  if (!store) {
    store = create<DecorateStore>(() => ({
      decorates: [],
    }))
    EDITOR_TO_DECORATE_STORE.set(editor, store)
  }
  return store
}

export const Decorate = {
  getStore: getStore,

  add: (editor: Editable, decorate: Decorate) => {
    const store = getStore(editor)
    store.setState(state => ({
      decorates: [...state.decorates, decorate],
    }))
  },

  remove: (editor: Editable, decorate: Decorate | string) => {
    const store = getStore(editor)
    const isKey = typeof decorate === 'string'
    store.setState(state => ({
      decorates: state.decorates.filter(d => (isKey ? d.key !== decorate : d !== decorate)),
    }))
  },
}
