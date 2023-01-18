import { EditorView } from '@codemirror/view'
import { MutableRefObject } from 'react'
import { useExtension } from './use-extension'

export function useLineWrapping(view: MutableRefObject<EditorView | null>, autoWrap: boolean) {
  return useExtension(view, () => [autoWrap ? EditorView.lineWrapping : []], [autoWrap])
}
