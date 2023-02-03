import {
  Decorate,
  SlotComponentProps,
  TextDecorate,
  useEditableStatic,
  useIsomorphicLayoutEffect,
} from '@editablejs/editor'
import { Path } from '@editablejs/models'
import { FC, useRef } from 'react'
import { useMentionOpen } from '../hooks/use-mention-open'
import { MentionEditor } from '../plugin/mention-editor'
import { getMentionTriggerData } from '../weak-map'
import { MentionPlaceholder } from './mention-placeholder'
import { MentionSearch } from './mention-search'

export interface MentionDecorateProps extends SlotComponentProps {}

export const MentionDecorate: FC<MentionDecorateProps> = () => {
  const editor = useEditableStatic()
  const open = useMentionOpen(editor)
  const ref = useRef<HTMLDivElement | null>(null)
  useIsomorphicLayoutEffect(() => {
    if (!open || !MentionEditor.isMentionEditor(editor)) return
    const data = getMentionTriggerData(editor)
    if (!data) return
    const decorate: TextDecorate = {
      match: (_, path) => {
        return data.rangeRef.current && Path.equals(data.rangeRef.current.focus.path, path)
          ? [data.rangeRef.current]
          : []
      },
      renderText: ({ children }) => (
        <MentionSearch editor={editor} container={ref.current ?? undefined}>
          <MentionPlaceholder editor={editor}>{children}</MentionPlaceholder>
        </MentionSearch>
      ),
    }

    Decorate.create(editor, decorate)
    return () => {
      Decorate.remove(editor, decorate)
    }
  }, [open, editor])

  return <div ref={ref} />
}
