import { Element } from '@editablejs/models'
import { MENTION_KEY } from '../constants'

export interface MentionUser {
  id: string | number
  name: string
  avatar?: string
}

export interface Mention<T = MentionUser> extends Element {
  type: typeof MENTION_KEY
  user: T
}

export const Mention = {
  create: <T = MentionUser>(user: T): Mention<T> => {
    return {
      type: MENTION_KEY,
      user,
      children: [{ text: '' }],
    }
  },
  isMention: <T = MentionUser>(value: any): value is Mention<T> => {
    return Element.isElement(value) && value.type === MENTION_KEY
  },
}
