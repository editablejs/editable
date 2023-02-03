import { Text } from '@editablejs/models'
import { LinkHotkey, LinkOptions } from './options'
import { Link } from './interfaces/link'
import { LinkLocale } from './locale'

const { isText } = Text
Text.isText = (value): value is Text => {
  return !Link.isLink(value) && isText(value)
}

export type { LinkOptions, LinkLocale, LinkHotkey }

export * from './interfaces/link'

export * from './plugin/link-editor'

export * from './plugin/with-link'
