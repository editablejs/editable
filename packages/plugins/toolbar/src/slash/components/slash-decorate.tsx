import {
  Decorate,
  SlotComponentProps,
  TextDecorate,
  useEditableStatic,
  useIsomorphicLayoutEffect,
} from '@editablejs/editor'
import { Path, Transforms } from '@editablejs/models'
import { FC, useCallback, useRef } from 'react'
import { useSlashToolbarOpen } from '../hooks/use-slash-toolbar-open'
import { closeSlashDecorate } from '../utils'
import { getSlashTriggerData } from '../weak-map'
import { SlashToolbarPlaceholder } from './slash-placeholder'
import { SlashToolbarSearch } from './slash-search'

export interface SlashDecorateProps extends SlotComponentProps {}

export const SlashToolbarDecorate: FC<SlashDecorateProps> = () => {
  const editor = useEditableStatic()
  const open = useSlashToolbarOpen(editor)
  const ref = useRef<HTMLDivElement | null>(null)

  const handleSelect = useCallback(() => {
    const data = getSlashTriggerData(editor)
    if (data) {
      const at = data.rangeRef.current
      if (at)
        Transforms.delete(editor, {
          at,
        })
    }
    closeSlashDecorate(editor)
  }, [editor])

  useIsomorphicLayoutEffect(() => {
    if (!open) return
    const data = getSlashTriggerData(editor)
    if (!data) return
    const decorate: TextDecorate = {
      match: (_, path) => {
        return data.rangeRef.current && Path.equals(data.rangeRef.current.focus.path, path)
          ? [data.rangeRef.current]
          : []
      },
      renderText: ({ children }) => (
        <SlashToolbarSearch
          editor={editor}
          container={ref.current ?? undefined}
          onSelect={handleSelect}
        >
          <SlashToolbarPlaceholder editor={editor}>{children}</SlashToolbarPlaceholder>
        </SlashToolbarSearch>
      ),
    }

    Decorate.create(editor, decorate)
    return () => {
      Decorate.remove(editor, decorate)
    }
  }, [open, editor, handleSelect])

  return <div ref={ref} />
}
