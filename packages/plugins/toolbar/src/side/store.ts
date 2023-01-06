import * as React from 'react'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { Editable, useIsomorphicLayoutEffect, Range, Element } from '@editablejs/editor'
import { ContextMenuItem as UIContextMenuItem } from '@editablejs/ui'

interface BaseSideToolbarItem extends UIContextMenuItem {
  key: string
  title: React.ReactElement | string
  children?: SideToolbarItem[]
}

interface ToolbarState {
  items: SideToolbarItem[]
  open: boolean
  range?: Range
  element?: Element
}

export type SideToolbarItem =
  | BaseSideToolbarItem
  | {
      type: 'separator'
    }
  | {
      content:
        | React.ReactElement
        | string
        | React.FC<Record<'onSelect', (event: React.MouseEvent) => void>>
    }

const EDITOR_TO_TOOLBAR_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<ToolbarState>>>()

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_TOOLBAR_STORE.get(editor)
  if (!store) {
    store = create<ToolbarState>(() => ({
      items: [],
      open: false,
    }))
    EDITOR_TO_TOOLBAR_STORE.set(editor, store)
  }
  return store
}

export const useSideToolbarStore = (editor: Editable) => {
  return React.useMemo(() => getStore(editor), [editor])
}

export const useSideToolbarItems = (editor: Editable) => {
  const store = useSideToolbarStore(editor)
  return useStore(store, state => state.items, shallow)
}

export const useSideToolbarMenuOpen = (
  editor: Editable,
): [boolean, (open: boolean, data?: { range?: Range; element?: Element }) => void] => {
  const store = useSideToolbarStore(editor)
  const open = useStore(store, state => state.open)
  return React.useMemo(
    () => [
      open,
      (open: boolean, data?: { range?: Range; element?: Element }) => {
        SideToolbar.setOpen(editor, open, data)
      },
    ],
    [editor, open],
  )
}

type SideToolbarEffectCallback = (range: Range, element: Element) => (() => void) | void
export const useSideToolbarMenuEffect = (aciton: SideToolbarEffectCallback, editor: Editable) => {
  const [open] = useSideToolbarMenuOpen(editor)
  useIsomorphicLayoutEffect(() => {
    let destroy: (() => void) | void

    const { range, element } = getStore(editor).getState()
    if (open && range && element) {
      destroy = aciton(range, element)
    }
    return () => {
      if (destroy) destroy()
    }
  }, [open, editor, aciton])
}

export const SideToolbar = {
  setOpen(editor: Editable, open: boolean, data?: { range?: Range; element?: Element }) {
    const store = getStore(editor)
    store.setState({ open, ...data })
  },

  setItems(editor: Editable, items: SideToolbarItem[]) {
    const store = getStore(editor)
    store.setState({ items })
  },
}
