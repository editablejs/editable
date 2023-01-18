import { EditorState, EditorStateConfig } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useIsomorphicLayoutEffect } from '@editablejs/editor'
import { useCallback, useState, useRef } from 'react'

export function useEditorView(initState: (() => EditorStateConfig) | EditorStateConfig = {}) {
  const [element, setElement] = useState<HTMLElement>()

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return
    setElement(node)
  }, [])
  const viewRef = useRef<EditorView | null>(null)
  useIsomorphicLayoutEffect(() => {
    if (!element) return
    const view = new EditorView({
      state: EditorState.create(typeof initState === 'function' ? initState() : initState),
      parent: element,
    })
    view.focus()
    viewRef.current = view
    return () => view.destroy()
  }, [element])
  return [viewRef, ref] as const
}
