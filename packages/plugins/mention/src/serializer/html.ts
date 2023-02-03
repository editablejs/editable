import { Editor } from '@editablejs/models'
import { HTMLSerializerWithOptions, HTMLSerializerWithTransform } from '@editablejs/serializer/html'

import { MENTION_DATA_USER_PREFIX } from '../constants'
import { getTriggerChar } from '../get-trigger-char'
import { Mention } from '../interfaces/mention'

export interface MentionHTMLSerializerWithOptions extends HTMLSerializerWithOptions {
  editor: Editor
}

export const withMentionHTMLSerializerTransform: HTMLSerializerWithTransform<
  MentionHTMLSerializerWithOptions
> = (next, serializer, customOptions) => {
  const { attributes: customAttributes, style: customStyle, editor } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (Mention.isMention(node)) {
      const { user } = node
      const mentionAttributes: Record<string, string | undefined> = {}
      for (const key in Object.keys(user)) {
        mentionAttributes[`${MENTION_DATA_USER_PREFIX}${key}`] = String(
          user[key as keyof typeof user],
        )
      }
      return serializer.create(
        'span',
        serializer.mergeOptions(node, attributes, customAttributes, mentionAttributes),
        serializer.mergeOptions(node, style, customStyle),
        `${getTriggerChar(editor)}${user.name}`,
      )
    }
    return next(node, options)
  }
}
