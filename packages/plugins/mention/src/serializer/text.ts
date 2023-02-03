import { Editor } from '@editablejs/models'
import { TextSerializerOptions, TextSerializerWithTransform } from '@editablejs/serializer/text'

import { getTriggerChar } from '../get-trigger-char'
import { Mention } from '../interfaces/mention'

export interface MentionTextSerializerOptions extends TextSerializerOptions {
  editor: Editor
}

export const withMentionTextSerializerTransform: TextSerializerWithTransform<
  MentionTextSerializerOptions
> = (next, _, { editor }) => {
  return node => {
    if (Mention.isMention(node)) {
      return `${getTriggerChar(editor)}${node.user.name}`
    }
    return next(node)
  }
}
