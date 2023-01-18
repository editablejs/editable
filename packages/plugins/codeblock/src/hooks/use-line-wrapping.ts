import { EditorView } from '@codemirror/view'
import { useExtension } from './use-extension'

export function useLineWrapping(view: EditorView | null, lineWrapping: boolean) {
  return useExtension(view, () => [lineWrapping ? EditorView.lineWrapping : []], [lineWrapping])
}
