import { Descendant, Element } from '@editablejs/models'
import { HeadingTags } from '../constants'

export type HeadingType = keyof typeof HeadingTags

export interface Heading extends Element {
  type: HeadingType
}

export type HeadingFontStyleName = 'fontSize' | 'fontWeight'

export type HeadingTextMark = Record<HeadingFontStyleName, string>

export const Heading = {
  isHeading: (value: any): value is Heading => {
    return Element.isElement(value) && !!value.type && value.type in HeadingTags
  },

  create: (type: HeadingType, children: Descendant[] = [{ text: '' }]): Heading => {
    return {
      type,
      children,
    }
  },
}
