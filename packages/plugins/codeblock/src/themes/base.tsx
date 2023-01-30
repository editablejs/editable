import { EditorView } from '@codemirror/view'
import tw from 'twin.macro'

export const baseTheme = [
  EditorView.baseTheme({
    '&.cm-focused': tw`outline-none`,
    '.cm-scroller': tw`font-mono leading-normal text-base py-1`,
    '.cm-gutters': tw`bg-transparent border-none`,
    '.cm-lineNumbers .cm-gutterElement': tw`pl-4 pr-1`,
  }),
]
