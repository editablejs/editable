import { EditorState, EditorStateConfig } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useIsomorphicLayoutEffect } from '@editablejs/editor'
import { useCallback, useState } from 'react'

export function useEditorView(
  initState: (() => EditorStateConfig) | EditorStateConfig = {},
  autoFocus = true,
  deps: any[] = [],
) {
  const [element, setElement] = useState<HTMLElement>()

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return
    setElement(node)
  }, [])
  const [view, setView] = useState<EditorView | null>(null)
  useIsomorphicLayoutEffect(() => {
    if (!element) return
    const view = new EditorView({
      state: EditorState.create(typeof initState === 'function' ? initState() : initState),
      parent: element,
    })
    if (autoFocus) view.focus()
    setView(view)

    return () => view.destroy()
  }, [element, ...deps])
  return {
    view,
    ref,
  }
}
