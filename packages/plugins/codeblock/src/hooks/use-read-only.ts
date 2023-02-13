import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useExtension } from './use-extension'

export function useReadOnly(view: EditorView | null, readOnly: boolean) {
  return useExtension(view, () => [EditorState.readOnly.of(readOnly)], [readOnly])
}
