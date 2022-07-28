import { BaseText, BaseElement } from 'slate'

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
