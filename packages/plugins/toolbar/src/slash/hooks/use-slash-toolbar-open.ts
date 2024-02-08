import { Editor } from '@editablejs/models'
import { useStore } from 'rezon-store'
import { SlashToolbar } from '../store'
import { useSlashToolbarStore } from './use-slash-toolbar-store'
import { useMemo } from 'rezon'

export const useSlashToolbarOpen = (editor: Editor): [boolean, (open: boolean) => void] => {
  const store = useSlashToolbarStore(editor)
  const open = useStore(store, state => state.open)
  return useMemo(
    () => [
      open,
      (open: boolean) => {
        SlashToolbar.setOpen(editor, open)
      },
    ],
    [editor, open],
  )
}
