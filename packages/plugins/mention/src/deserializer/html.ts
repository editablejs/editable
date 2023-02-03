import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { isDOMHTMLElement } from '@editablejs/models'
import { MENTION_DATA_USER_PREFIX } from '../constants'
import { Mention, MentionUser } from '../interfaces/mention'

export const withMentionHTMLDeserializerTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    if (isDOMHTMLElement(node)) {
      const attributeNames = node.getAttributeNames()
      if (
        attributeNames.filter(
          name =>
            name === `${MENTION_DATA_USER_PREFIX}id` || name === `${MENTION_DATA_USER_PREFIX}name`,
        ).length === 2
      ) {
        const user: Partial<MentionUser> = {}
        for (const name of attributeNames) {
          const key = name.replace(MENTION_DATA_USER_PREFIX, '') as keyof typeof user
          const value = node.getAttribute(name)
          if (value) user[key] = value
        }
        const mention = Mention.create(user)
        return [mention]
      }
    }
    return next(node, options)
  }
}
