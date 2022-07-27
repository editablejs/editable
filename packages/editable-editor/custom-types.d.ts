import { BaseRange, BaseText, BaseElement } from 'slate'
import { Editable } from './src/plugin/editable'

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
