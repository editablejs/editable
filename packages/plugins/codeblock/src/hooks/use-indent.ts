import { indentUnit } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useExtension } from './use-extension'

export function useIndent(view: EditorView | null, tabSize: number) {
  return useExtension(
    view,
    () => [EditorState.tabSize.of(tabSize), indentUnit.of(' '.repeat(tabSize))],
    [tabSize],
  )
}
