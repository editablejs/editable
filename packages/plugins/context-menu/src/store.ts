import { useMemo } from 'react'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { Editable, useIsomorphicLayoutEffect } from '@editablejs/editor'
import { ContextMenuItem as UIContextMenuItem } from '@editablejs/plugin-ui'

interface BaseContextMenuItem extends UIContextMenuItem {
  key: string
  title: JSX.Element | string
  href?: string
  children?: ContextMenuItem[]
}

export type ContextMenuItem =
  | BaseContextMenuItem
  | {
      type: 'separator'
    }

interface ContextMenuState {
  items: ContextMenuItem[]
  opened: boolean
}

const EDITOR_TO_CONTEXT_MENU_STORE = new WeakMap<
  Editable,
  UseBoundStore<StoreApi<ContextMenuState>>
>()

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_CONTEXT_MENU_STORE.get(editor)
  if (!store) {
    store = create<ContextMenuState>(() => ({
      items: [],
      opened: false,
    }))
    EDITOR_TO_CONTEXT_MENU_STORE.set(editor, store)
  }
  return store
}

export const useContextMenuStore = (editor: Editable) => {
  return useMemo(() => getStore(editor), [editor])
}

export const useContextMenuItems = (editor: Editable) => {
  const store = useContextMenuStore(editor)
  return useStore(store, state => state.items, shallow)
}

export const useContextMenuOpened = (editor: Editable): [boolean, (opened: boolean) => void] => {
  const store = useContextMenuStore(editor)
  const opened = useStore(store, state => state.opened)
  return [
    opened,
    (opened: boolean) => {
      ContextMenuStore.setOpened(editor, opened)
    },
  ]
}

type ContextMenuStoreAction = (editor: Editable) => (() => void) | void

export const useContextMenuEffect = (aciton: ContextMenuStoreAction, editor: Editable) => {
  const [opened] = useContextMenuOpened(editor)
  useIsomorphicLayoutEffect(() => {
    let destroy: (() => void) | void
    if (opened) {
      destroy = aciton(editor)
    }
    return destroy
  }, [opened, editor, aciton])
}

export const ContextMenuStore = {
  setOpened(editor: Editable, opened: boolean) {
    const store = getStore(editor)
    store.setState(() => ({ opened }))
  },

  setItems(editor: Editable, items: ContextMenuItem[]) {
    const store = getStore(editor)
    store.setState(() => {
      return {
        items,
      }
    })
  },
}
