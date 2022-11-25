import { Element } from '@editablejs/editor'
import { HeadingTags } from './constants'
import { Heading } from './types'

export const isHeading = (value: any): value is Heading => {
  return Element.isElement(value) && !!value.type && value.type in HeadingTags
}
