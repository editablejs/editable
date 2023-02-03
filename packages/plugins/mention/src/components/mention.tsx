import { Editable, RenderElementProps } from '@editablejs/editor'
import { Text } from '@editablejs/models'
import { FC } from 'react'
import { getTriggerChar } from '../get-trigger-char'
import { Mention } from '../interfaces/mention'

export interface MentionComponentProps extends RenderElementProps<Mention> {
  editor: Editable
}

export const MentionComponent: FC<MentionComponentProps> = ({
  editor,
  children,
  element,
  attributes,
}) => {
  const { user } = element

  return (
    <span
      {...attributes}
      tw="rounded cursor-pointer bg-primary/10 text-primary hover:bg-primary/25 px-1 py-0.5"
    >
      {editor.renderLeaf({
        text: element.children[0] as Text,
        attributes: {},
        children: `${getTriggerChar(editor)}${user.name}`,
      })}
      <span tw="hidden">{children}</span>
    </span>
  )
}
