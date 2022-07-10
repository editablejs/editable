import { BaseRange, BaseText } from 'slate'
import { EditableEditor } from './plugin/editable-editor'

declare module 'slate' {
  interface CustomTypes {
    Text: BaseText & {
      placeholder?: string
      composition?: {
        text: string
        offset: number
      }
    }
    Range: BaseRange & {
      placeholder?: string
    }
  }
}
