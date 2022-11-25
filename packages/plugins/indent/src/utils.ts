import { Element } from '@editablejs/editor'
import { INDENT_KEY } from './constants'
import { Indent } from './types'

export const isIndent = (value: any): value is Indent => {
  return Element.isElement(value) && value.type === INDENT_KEY
}
