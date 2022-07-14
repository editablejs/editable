import { BaseRange, BaseText, BaseElement } from 'slate'
import { EditableEditor } from './src/plugin/editable-editor'

declare module 'slate' {
  interface CustomTypes {
    Text: BaseText & {
      composition?: {
        text: string
        offset: number
        emptyText?: boolean
      }
    },
    Element: BaseElement & {
      type?: string
    }
  }
}
