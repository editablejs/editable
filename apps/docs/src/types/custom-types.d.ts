import { BaseElement } from '@editablejs/editor'

declare module '@editablejs/editor' {
  interface CustomTypes {
    Element: BaseElement & {
      type?: string
    }
  }
}
