import { BaseElement, BaseText } from 'slate'

declare module 'slate' {
  interface CustomTypes {
    Element: BaseElement & {
      type?: string
    }
  }
}
