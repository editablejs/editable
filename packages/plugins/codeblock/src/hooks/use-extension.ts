import { Extension, Compartment, StateEffect } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useMemo, useEffect, MutableRefObject } from 'react'

export function useExtension(
  view: MutableRefObject<EditorView | null>,
  extensionCreator: () => Extension,
  deps: any[],
) {
  const compartment = useMemo(() => new Compartment(), [])
  const extension = useMemo(extensionCreator, deps)

  useEffect(() => {
    if (!view.current) return
    const v = view.current
    if (!compartment.get(v.state)) {
      v.dispatch({ effects: StateEffect.appendConfig.of(compartment.of(extension)) })
    } else {
      v.dispatch({ effects: compartment.reconfigure(extension) })
    }
  }, [view, extension])
}
