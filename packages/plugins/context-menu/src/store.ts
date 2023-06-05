import * as React from 'react'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { Editable, useIsomorphicLayoutEffect } from '@editablejs/editor'
import { ContextMenuItem as UIContextMenuItem } from '@editablejs/ui'

interface BaseContextMenuItem extends Omit<UIContextMenuItem, 'children'> {
  key: string
  title: React.ReactElement | string
  children?: ContextMenuItem[]
}

export type ContextMenuItem =
  | BaseContextMenuItem
  | {
      type: 'separator'
    }
  | {
      content:
        | React.ReactElement
        | string
        | React.FC<Record<'onSelect', (event: React.MouseEvent) => void>>
    }

interface ContextMenuState {
  items: ContextMenuItem[]
  open: boolean
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
      open: false,
    }))
    EDITOR_TO_CONTEXT_MENU_STORE.set(editor, store)
  }
  return store
}

export const useContextMenuStore = (editor: Editable) => {
  return React.useMemo(() => getStore(editor), [editor])
}

export const useContextMenuItems = (editor: Editable) => {
  const store = useContextMenuStore(editor)
  return useStore(store, state => state.items, shallow)
}

export const useContextMenuOpen = (editor: Editable): [boolean, (open: boolean) => void] => {
  const store = useContextMenuStore(editor)
  const open = useStore(store, state => state.open)
  return React.useMemo(() => {
    return [
      open,
      (open: boolean) => {
        ContextMenu.setOpen(editor, open)
      },
    ]
  }, [editor, open])
}

type ContextMenuStoreAction = () => (() => void) | void

export const useContextMenuEffect = (aciton: ContextMenuStoreAction, editor: Editable) => {
  const [open] = useContextMenuOpen(editor)
  useIsomorphicLayoutEffect(() => {
    let destroy: (() => void) | void = undefined;
    if (open) {
      destroy = aciton()
    }
    return destroy
  }, [open, editor, aciton])
}

export const ContextMenu = {
  setOpen(editor: Editable, open: boolean) {
    const store = getStore(editor)
    store.setState(() => ({ open }))
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
