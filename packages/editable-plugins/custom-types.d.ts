import { BaseElement, BaseText } from 'slate'
import { Editable } from './plugin/editable-editor'

declare module 'slate' {
  interface CustomTypes {
    Element: BaseElement & {
      type?: string
    }
  }
}
