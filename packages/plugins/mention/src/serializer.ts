import {
  Editable,
  HTMLSerializerWithOptions,
  HTMLSerializerWithTransform,
  TextSerializerOptions,
  TextSerializerWithTransform,
} from '@editablejs/editor'
import { MENTION_DATA_USER_PREFIX } from './constants'
import { getTriggerChar } from './get-trigger-char'
import { Mention } from './interfaces/mention'

export interface MentionHTMLSerializerWithOptions extends HTMLSerializerWithOptions {
  editor: Editable
}

export const withMentionHTMLTransform: HTMLSerializerWithTransform<
  MentionHTMLSerializerWithOptions
> = (next, serializer, customOptions) => {
  const { attributes: customAttributes, style: customStyle, editor } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (Mention.isMention(node)) {
      const { user } = node
      const mentionAttributes: Record<string, string | undefined> = {}
      for (const key in Object.keys(user)) {
        mentionAttributes[`${MENTION_DATA_USER_PREFIX}${key}`] = user[key as keyof typeof user]
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

export interface MentionTextSerializerOptions extends TextSerializerOptions {
  editor: Editable
}

export const withMentionTextTransform: TextSerializerWithTransform<MentionTextSerializerOptions> = (
  next,
  _,
  { editor },
) => {
  return node => {
    if (Mention.isMention(node)) {
      return `${getTriggerChar(editor)}${node.user.name}`
    }
    return next(node)
  }
}
