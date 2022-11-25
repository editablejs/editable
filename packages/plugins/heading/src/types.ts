import { Element } from '@editablejs/editor'
import { HeadingTags } from './constants'

export type HeadingType = keyof typeof HeadingTags

export interface Heading extends Element {
  type: HeadingType
}

export type HeadingFontStyleName = 'fontSize' | 'fontWeight'

export type HeadingTextMark = Record<HeadingFontStyleName, string>
