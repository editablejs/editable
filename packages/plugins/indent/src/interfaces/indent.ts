import { Element } from '@editablejs/models'
import { INDENT_KEY, OUTDENT_KEY } from '../constants'

export interface Indent extends Element {
  /**
   * The indentation level of the text.
   */
  textIndent?: number
  /**
   * The indentation level of the element.
   */
  lineIndent?: number
}

export type IndentType = 'text' | 'line'

export type IndentPluginType = typeof INDENT_KEY | typeof OUTDENT_KEY

export const Indent = {
  isIndent: (value: any): value is Indent => {
    return Element.isElement(value) && value.type === INDENT_KEY
  },
}
