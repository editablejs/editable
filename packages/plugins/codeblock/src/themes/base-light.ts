import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
const background = '#fafafa',
  color = '#232930',
  selection = '#b3d4fc'
export const colors = {
  background,
  color,
}
export const baseLight = [
  EditorView.theme({
    '&': {
      background,
      color,
    },
    '.cm-content': {
      caretColor: color,
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: color,
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: selection,
    },
  }),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
]
