import { BaseRange, BaseText } from 'slate'
import { EditableEditor } from './src/plugin/editable-editor'

declare module 'slate' {
  interface CustomTypes {
    Text: BaseText & {
      composition?: {
        text: string
        offset: number
        emptyText?: boolean
      }
    }
  }
}
