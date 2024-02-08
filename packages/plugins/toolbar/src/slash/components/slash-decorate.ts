import {
  Decorate,
  SlotComponentProps,
  TextDecorate,
  useEditableStatic,
  useIsomorphicLayoutEffect,
} from '@editablejs/editor'
import { Path, Transforms } from '@editablejs/models'
import { useSlashToolbarOpen } from '../hooks/use-slash-toolbar-open'
import { closeSlashDecorate } from '../utils'
import { getSlashTriggerData } from '../weak-map'
import { SlashToolbarPlaceholder } from './slash-placeholder'
import { SlashToolbarSearch } from './slash-search'
import { useCallback, useRef, c, html } from 'rezon'
import { ref } from 'rezon/directives/ref'

export interface SlashDecorateProps extends SlotComponentProps { }

export const SlashToolbarDecorate = c<SlashDecorateProps>(() => {
  const editor = useEditableStatic()
  const open = useSlashToolbarOpen(editor)
  const containerRef = useRef<HTMLDivElement | null>(null)

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
      renderText: ({ children }) => SlashToolbarSearch({
        editor,
        container: containerRef.current ?? undefined,
        onSelect: handleSelect,
        children: SlashToolbarPlaceholder({
          editor,
          children,
        }),
      })
    }

    Decorate.create(editor, decorate)
    return () => {
      Decorate.remove(editor, decorate)
    }
  }, [open, editor, handleSelect])

  return html`<div ref=${ref(containerRef)}></div>`
})
