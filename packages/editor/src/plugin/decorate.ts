import * as React from 'react'
import { Editor, Range, Node, Path, Text, Element } from '@editablejs/models'
import create, { StoreApi, UseBoundStore } from 'zustand'
export interface DecorateRenderProps<T = Node> {
  node: T
  path: Path
  children: React.ReactElement
}

export interface BaseDecorate {
  key?: string
}
export interface TextDecorate extends BaseDecorate {
  match: (node: Text, path: Path) => Range[]
  renderText: (props: DecorateRenderProps<Text>) => React.ReactElement
}

export interface ElementDecorate extends BaseDecorate {
  match: (node: Element, path: Path) => boolean
  renderElement: (props: DecorateRenderProps<Element>) => React.ReactElement
}

export type Decorate = TextDecorate | ElementDecorate

export interface DecorateStore {
  decorations: Decorate[]
}

const EDITOR_TO_DECORATE_STORE = new WeakMap<Editor, UseBoundStore<StoreApi<DecorateStore>>>()

export const getDecorateStore = (editor: Editor) => {
  let store = EDITOR_TO_DECORATE_STORE.get(editor)
  if (!store) {
    store = create<DecorateStore>(() => ({
      decorations: [],
    }))
    EDITOR_TO_DECORATE_STORE.set(editor, store)
  }
  return store
}

const predicate = (decorate: Decorate | string) => {
  const isKey = typeof decorate === 'string'
  return (d: Decorate) => {
    return isKey ? d.key === decorate : d === decorate
  }
}

export const Decorate = {
  isTextDecorate: (value: any): value is TextDecorate => {
    return value && typeof value.match === 'function' && typeof value.renderText === 'function'
  },

  create: (editor: Editor, decorate: Decorate) => {
    const store = getDecorateStore(editor)
    store.setState(state => ({
      decorations: [...state.decorations, decorate],
    }))
  },

  remove: (editor: Editor, decorate: Decorate | string) => {
    const store = getDecorateStore(editor)
    store.setState(state => ({
      decorations: state.decorations.filter(d => !predicate(decorate)(d)),
    }))
  },

  has: (editor: Editor, decorate: Decorate | string) => {
    const store = getDecorateStore(editor)
    return store.getState().decorations.some(predicate(decorate))
  },
}
