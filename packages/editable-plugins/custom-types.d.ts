import { BaseElement, BaseRange, BaseText } from 'slate'
import { EditableEditor } from './plugin/editable-editor'

declare module 'slate' {
  interface CustomTypes {
    Text: BaseText & {
      bold?: boolean
      italic?: boolean
      underline?: boolean
      strikethrough?: boolean
      code?: boolean
      sup?: boolean
      sub?: boolean
      fontSize?: string
    },
    Element: BaseElement & {
      type?: string
    }
  }
}
