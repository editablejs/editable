import * as React from 'react'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { Editable, useIsomorphicLayoutEffect } from '@editablejs/editor'
import { Range, Element } from '@editablejs/models'
import { ContextMenuItem as UIContextMenuItem } from '@editablejs/ui'
import { getCapturedData } from './weak-map'

interface BaseSideToolbarItem extends Omit<UIContextMenuItem, 'children'> {
  key: string
  title: React.ReactElement | string
  children?: SideToolbarItem[]
}

interface ToolbarState {
  items: SideToolbarItem[]
  menuOpen: boolean
  decorateOpen: boolean
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
      menuOpen: false,
      decorateOpen: false,
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

export const useSideToolbarDecorateOpen = (editor: Editable) => {
  const store = useSideToolbarStore(editor)
  return useStore(store, ({ decorateOpen }) => {
    return decorateOpen
  })
}

export const useSideToolbarMenuOpen = (editor: Editable): [boolean, (open: boolean) => void] => {
  const store = useSideToolbarStore(editor)
  const open = useStore(store, state => state.menuOpen)
  return React.useMemo(
    () => [
      open,
      (open: boolean) => {
        SideToolbar.setOpen(editor, open)
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

    const data = getCapturedData(editor)
    if (open && data) {
      const { selection, element } = data
      destroy = aciton(selection, element)
    }
    return () => {
      if (destroy) destroy()
    }
  }, [open, editor, aciton])
}

export const SideToolbar = {
  setOpen(editor: Editable, open: boolean) {
    const store = getStore(editor)
    store.setState({ menuOpen: open })
  },

  setItems(editor: Editable, items: SideToolbarItem[]) {
    const store = getStore(editor)
    store.setState({ items })
  },

  setDecorateOpen(editor: Editable, open: boolean) {
    const store = getStore(editor)
    store.setState({
      decorateOpen: open,
    })
  },
}
