import { BaseRange, BaseText } from 'slate'
import { EditableEditor } from './plugin/editable-editor'

declare module 'slate' {
  interface CustomTypes {
    Text: BaseText & {
      composition?: {
        text: string
        offset: number
      }
    }
  }
}
