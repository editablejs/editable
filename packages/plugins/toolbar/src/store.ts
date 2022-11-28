import { useMemo, useRef } from 'react'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { Editable, useIsomorphicLayoutEffect, Range, Element } from '@editablejs/editor'
import {
  ToolbarButton as UIToolbarButton,
  ToolbarDropdown as UIToolbarDropdown,
  ContextMenuItem as UIContextMenuItem,
} from '@editablejs/plugin-ui'

export interface ToolbarButtonItem extends Omit<UIToolbarButton, 'onToggle'> {
  onToggle?: <T extends Editable>(editor: T) => void
  type: 'button'
}

export interface ToolbarDropdownItem extends Omit<UIToolbarDropdown, 'onToggle'> {
  type: 'dropdown'
  onToggle?: <T extends Editable>(editor: T, value: string) => void
}

export type ToolbarItem = ToolbarButtonItem | ToolbarDropdownItem | 'separator'

interface ToolbarState {
  toolbar: {
    items: ToolbarItem[]
  }
  inline: {
    items: ToolbarItem[]
    open: boolean
  }
  sideMenu: {
    items: SideToolbarItem[]
    open: boolean
    range?: Range
    element?: Element
  }
}
interface BaseSideToolbarItem extends UIContextMenuItem {
  key: string
  title: JSX.Element | string
  children?: SideToolbarItem[]
}

export type SideToolbarItem =
  | BaseSideToolbarItem
  | {
      type: 'separator'
    }

const EDITOR_TO_TOOLBAR_STORE = new WeakMap<Editable, UseBoundStore<StoreApi<ToolbarState>>>()

const getStore = (editor: Editable) => {
  let store = EDITOR_TO_TOOLBAR_STORE.get(editor)
  if (!store) {
    store = create<ToolbarState>(() => ({
      toolbar: {
        items: [],
      },
      inline: {
        items: [],
        open: false,
      },
      sideMenu: {
        items: [],
        open: false,
      },
    }))
    EDITOR_TO_TOOLBAR_STORE.set(editor, store)
  }
  return store
}

export const useToolbarStore = (editor: Editable) => {
  return useMemo(() => getStore(editor), [editor])
}

export const useToolbarItems = (editor: Editable) => {
  const store = useToolbarStore(editor)
  return useStore(store, state => state.toolbar.items, shallow)
}

export const useInlineToolbarItems = (editor: Editable) => {
  const store = useToolbarStore(editor)
  return useStore(store, state => state.inline.items, shallow)
}

export const useInlineToolbarOpen = (editor: Editable): [boolean, (open: boolean) => void] => {
  const store = useToolbarStore(editor)
  const open = useStore(store, state => state.inline.open)
  return useMemo(
    () => [
      open,
      (open: boolean) => {
        ToolbarStore.setInlineOpen(editor, open)
      },
    ],
    [editor, open],
  )
}

export const useSideToolbarItems = (editor: Editable) => {
  const store = useToolbarStore(editor)
  return useStore(store, state => state.sideMenu.items, shallow)
}

export const useSideToolbarMenuOpen = (
  editor: Editable,
): [boolean, (open: boolean, data?: { range?: Range; element?: Element }) => void] => {
  const store = useToolbarStore(editor)
  const open = useStore(store, state => state.sideMenu.open)
  return useMemo(
    () => [
      open,
      (open: boolean, data?: { range?: Range; element?: Element }) => {
        ToolbarStore.setSideMenuOpen(editor, open, data)
      },
    ],
    [editor, open],
  )
}

type ToolbarEffectCallback = () => (() => void) | void

export const useToolbarEffect = (aciton: ToolbarEffectCallback, editor: Editable) => {
  const editorRef = useRef<Editable | null>(null)
  useIsomorphicLayoutEffect(() => {
    let destroy: (() => void) | void

    const handleSelectionChange = () => {
      if (destroy) destroy()
      destroy = aciton()
    }
    editor.on('selectionchange', handleSelectionChange)
    if (editorRef.current !== editor) {
      destroy = aciton()
      editorRef.current = editor
    }
    return () => {
      editor.off('selectionchange', handleSelectionChange)
      if (destroy) destroy()
    }
  }, [editor, aciton])
}

export const useInlineToolbarEffect = (aciton: ToolbarEffectCallback, editor: Editable) => {
  const [open] = useInlineToolbarOpen(editor)
  useIsomorphicLayoutEffect(() => {
    let destroy: (() => void) | void

    const handleSelectionChange = () => {
      if (destroy) destroy()
      destroy = aciton()
    }
    if (open) {
      destroy = aciton()
      editor.on('selectionchange', handleSelectionChange)
    }
    return () => {
      editor.off('selectionchange', handleSelectionChange)
      if (destroy) destroy()
    }
  }, [open, editor, aciton])
}

type SideToolbarEffectCallback = (range: Range, element: Element) => (() => void) | void
export const useSideToolbarMenuEffect = (aciton: SideToolbarEffectCallback, editor: Editable) => {
  const [open] = useSideToolbarMenuOpen(editor)
  useIsomorphicLayoutEffect(() => {
    let destroy: (() => void) | void

    const { range, element } = getStore(editor).getState().sideMenu
    if (open && range && element) {
      destroy = aciton(range, element)
    }
    return () => {
      if (destroy) destroy()
    }
  }, [open, editor, aciton])
}

export const ToolbarStore = {
  setToolbarItems(editor: Editable, items: ToolbarItem[]) {
    const store = getStore(editor)
    store.setState(() => {
      return {
        toolbar: {
          items,
        },
      }
    })
  },

  setInlineOpen(editor: Editable, open: boolean) {
    const store = getStore(editor)
    store.setState(({ inline }) => ({ inline: { ...inline, open } }))
  },

  setInlineItems(editor: Editable, items: ToolbarItem[]) {
    const store = getStore(editor)
    store.setState(({ inline }) => {
      return {
        inline: {
          ...inline,
          items,
        },
      }
    })
  },

  setSideMenuOpen(editor: Editable, open: boolean, data?: { range?: Range; element?: Element }) {
    const store = getStore(editor)
    store.setState(({ sideMenu }) => ({ sideMenu: { ...sideMenu, open, ...data } }))
  },

  setSideMenuItems(editor: Editable, items: SideToolbarItem[]) {
    const store = getStore(editor)
    store.setState(({ sideMenu }) => {
      return {
        sideMenu: {
          ...sideMenu,
          items,
        },
      }
    })
  },
}
