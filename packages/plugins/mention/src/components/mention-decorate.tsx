import {
  Decorate,
  Path,
  SlotComponentProps,
  TextDecorate,
  useEditableStatic,
  useIsomorphicLayoutEffect,
} from '@editablejs/editor'
import { FC } from 'react'
import { useMentionOpen } from '../hooks/use-mention-open'
import { getMentionTriggerData } from '../weak-map'
import { MentionPlaceholder } from './mention-placeholder'
import { MentionSearch } from './mention-search'

export interface MentionDecorateProps extends SlotComponentProps {}

export const MentionDecorate: FC<MentionDecorateProps> = () => {
  const editor = useEditableStatic()
  const open = useMentionOpen(editor)
  useIsomorphicLayoutEffect(() => {
    if (!open) return
    const data = getMentionTriggerData(editor)
    if (!data) return
    const decorate: TextDecorate = {
      match: (_, path) => {
        return data.rangeRef.current && Path.equals(data.rangeRef.current.focus.path, path)
          ? [data.rangeRef.current]
          : []
      },
      renderText: ({ children }) => (
        <MentionSearch editor={editor}>
          <MentionPlaceholder editor={editor}>{children}</MentionPlaceholder>
        </MentionSearch>
      ),
    }

    Decorate.create(editor, decorate)
    return () => {
      Decorate.remove(editor, decorate)
    }
  }, [open, editor])

  return null
}
