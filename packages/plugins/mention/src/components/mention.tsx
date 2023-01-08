import { RenderElementProps } from '@editablejs/editor'
import { FC } from 'react'
import { Mention } from '../interfaces/mention'
import { MentionEditor } from '../plugin/editor'

export interface MentionComponentProps extends RenderElementProps<Mention> {
  editor: MentionEditor
}

export const MentionComponent: FC<MentionComponentProps> = ({ editor, children, element }) => {
  return (
    <span>
      <span>@</span>
      <span>{children}</span>
    </span>
  )
}
