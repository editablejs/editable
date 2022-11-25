import { useMemo } from 'react'
import create, { StoreApi, UseBoundStore, useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { Editable, useIsomorphicLayoutEffect } from '@editablejs/editor'
import {
  ToolbarButton as UIToolbarButton,
  ToolbarDropdown as UIToolbarDropdown,
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
    opened: boolean
  }
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
        opened: false,
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

export const useInlineToolbarOpened = (editor: Editable): [boolean, (opened: boolean) => void] => {
  const store = useToolbarStore(editor)
  const opened = useStore(store, state => state.inline.opened)
  return [
    opened,
    (opened: boolean) => {
      ToolbarStore.setInlineOpened(editor, opened)
    },
  ]
}

type ToolbarStoreAction = (editor: Editable) => (() => void) | void

export const useToolbarEffect = (aciton: ToolbarStoreAction, editor: Editable) => {
  useIsomorphicLayoutEffect(() => {
    let destroy: (() => void) | void
    const { onSelectionChange } = editor

    editor.onSelectionChange = () => {
      onSelectionChange()
      destroy = aciton(editor)
    }
    return () => {
      editor.onSelectionChange = onSelectionChange
      if (destroy) destroy()
    }
  }, [editor, aciton])
}

export const useInlineToolbarEffect = (aciton: ToolbarStoreAction, editor: Editable) => {
  const [opened] = useInlineToolbarOpened(editor)
  useIsomorphicLayoutEffect(() => {
    let destroy: (() => void) | void
    if (opened) {
      destroy = aciton(editor)
    }
    return destroy
  }, [opened, editor, aciton])
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

  setInlineOpened(editor: Editable, opened: boolean) {
    const store = getStore(editor)
    store.setState(({ inline }) => ({ inline: { ...inline, opened } }))
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
}
