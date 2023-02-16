import { useIsomorphicLayoutEffect } from '@editablejs/editor'
import { Editor } from '@editablejs/models'
import { useSlashToolbarOpen } from './use-slash-toolbar-open'
import { useSlashToolbarSearchValue } from './use-slash-toolbar-search'

type SlashToolbarEffectCallback = (value: string) => (() => void) | void
export const useSlashToolbarEffect = (aciton: SlashToolbarEffectCallback, editor: Editor) => {
  const [open] = useSlashToolbarOpen(editor)
  const searchValue = useSlashToolbarSearchValue(editor)
  useIsomorphicLayoutEffect(() => {
    let destroy: (() => void) | void

    if (open) {
      destroy = aciton(searchValue)
    }
    return () => {
      if (destroy) destroy()
    }
  }, [open, searchValue, editor, aciton])
}
