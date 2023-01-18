import { Extension, Compartment, StateEffect } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useMemo, useEffect } from 'react'

export function useExtension(
  view: EditorView | null,
  extensionCreator: () => Extension,
  deps: any[],
) {
  const compartment = useMemo(() => new Compartment(), [])
  const extension = useMemo(extensionCreator, deps)

  useEffect(() => {
    if (!view) return
    if (!compartment.get(view.state)) {
      view.dispatch({ effects: StateEffect.appendConfig.of(compartment.of(extension)) })
    } else {
      view.dispatch({ effects: compartment.reconfigure(extension) })
    }
  }, [view, extension])
}
