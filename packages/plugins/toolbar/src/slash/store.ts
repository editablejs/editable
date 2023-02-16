import * as React from 'react'
import create, { StoreApi, UseBoundStore } from 'zustand'
import { Editor } from '@editablejs/models'

interface BaseSlashToolbarItem {
  icon?: JSX.Element
  key: string
  title: React.ReactElement | string
  disabled?: boolean
  onSelect?: () => void
}

export interface SlashToolbarState {
  items: SlashToolbarItem[]
  searchValue: string
  open: boolean
}

export type SlashToolbarItem =
  | BaseSlashToolbarItem
  | {
      type: 'separator'
    }
  | {
      content:
        | React.ReactElement
        | string
        | React.FC<Record<'onSelect', (event: React.MouseEvent) => void>>
    }

const EDITOR_TO_TOOLBAR_STORE = new WeakMap<Editor, UseBoundStore<StoreApi<SlashToolbarState>>>()

export const getSlashToolbarStore = (editor: Editor) => {
  let store = EDITOR_TO_TOOLBAR_STORE.get(editor)
  if (!store) {
    store = create<SlashToolbarState>(() => ({
      items: [],
      open: false,
      searchValue: '',
    }))
    EDITOR_TO_TOOLBAR_STORE.set(editor, store)
  }
  return store
}

export const SlashToolbar = {
  setOpen(editor: Editor, open: boolean) {
    const store = getSlashToolbarStore(editor)
    store.setState({ open })
  },

  setItems(editor: Editor, items: SlashToolbarItem[]) {
    const store = getSlashToolbarStore(editor)
    store.setState({ items })
  },

  setSearchValue(editor: Editor, searchValue: string) {
    const store = getSlashToolbarStore(editor)
    store.setState({ searchValue })
  },
}
