import { Locale } from '@editablejs/editor'

export interface CodeBlockLocale extends Locale {
  codeblock: {
    toolbar: {
      language: {
        title: string
        searchEmpty: string
      }
      theme: {
        title: string
        light: string
        dark: string
      }
      lineWrapping: {
        title: string
        autoWrap: string
        overflow: string
      }
      tabSize: string
    }
  }
}
