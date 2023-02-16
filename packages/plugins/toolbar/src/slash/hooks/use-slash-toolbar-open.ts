import { Editor } from '@editablejs/models'
import React from 'react'
import { useStore } from 'zustand'
import { SlashToolbar } from '../store'
import { useSlashToolbarStore } from './use-slash-toolbar-store'

export const useSlashToolbarOpen = (editor: Editor): [boolean, (open: boolean) => void] => {
  const store = useSlashToolbarStore(editor)
  const open = useStore(store, state => state.open)
  return React.useMemo(
    () => [
      open,
      (open: boolean) => {
        SlashToolbar.setOpen(editor, open)
      },
    ],
    [editor, open],
  )
}
