// Import necessary dependencies and models from @editablejs
import * as React from 'react'
import { Editor, Range, Node, Path, Text, Element } from '@editablejs/models'

// Import the create and StoreApi from zustand
import create, { StoreApi, UseBoundStore } from 'zustand'

// Define interface for properties passed to the render function of a text decoration
export interface DecorateRenderProps<T = Node> {
  node: T
  path: Path
  children: React.ReactElement
}

// Define BaseDecorate interface with a key property that is optional
export interface BaseDecorate {
  key?: string
}

// Define TextDecorate interface with match and renderText functions
export interface TextDecorate extends BaseDecorate {
  match: (node: Text, path: Path) => Range[]
  renderText: (props: DecorateRenderProps<Text>) => React.ReactElement
}

// Define ElementDecorate interface with match and renderElement functions
export interface ElementDecorate extends BaseDecorate {
  match: (node: Element, path: Path) => boolean
  renderElement: (props: DecorateRenderProps<Element>) => React.ReactElement
}

// Define a type for decorations which can either be a TextDecorate or an ElementDecorate
export type Decorate = TextDecorate | ElementDecorate

// Define DecorateStore interface with decorations property
export interface DecorateStore {
  decorations: Decorate[]
}

// Define a WeakMap to store Editor instances and their associated decoration stores
const EDITOR_TO_DECORATE_STORE = new WeakMap<Editor, UseBoundStore<StoreApi<DecorateStore>>>()

// Function to retrieve the decoration store for a given Editor instance
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

// Helper function to determine if a decoration is specified by its key or by its reference
const predicate = (decorate: Decorate | string) => {
  const isKey = typeof decorate === 'string'
  return (d: Decorate) => {
    return isKey ? d.key === decorate : d === decorate
  }
}

// Object to handle adding, removing, and checking the presence of decorations in a given Editor instance
export const Decorate = {
  // Check if a given value is a TextDecorate
  isTextDecorate: (value: any): value is TextDecorate => {
    return value && typeof value.match === 'function' && typeof value.renderText === 'function'
  },

  // Add a decoration to the decorations array of a given Editor instance
  create: (editor: Editor, decorate: Decorate) => {
    const store = getDecorateStore(editor)
    store.setState(state => ({
      decorations: [...state.decorations, decorate],
    }))
  },

  // Remove
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
