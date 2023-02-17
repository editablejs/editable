import * as React from 'react'
import { Editor, Node } from '@editablejs/models'
import { useStore } from 'zustand'
import { Placeholder } from '../plugin/placeholder'
import { useEditableStatic } from './use-editable'
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'
import { Editable } from '../plugin/editable'

export const usePlaceholderStore = () => {
  const editor = useEditableStatic()
  return React.useMemo(() => {
    return Placeholder.getStore(editor)
  }, [editor])
}

export const usePlaceholders = () => {
  const store = usePlaceholderStore()
  const placeholders = useStore(store, state => state.placeholders)
  return placeholders
}

export const usePlaceholder = (node: Node) => {
  const editor = useEditableStatic()
  const store = usePlaceholderStore()
  const actives = useStore(store, state => state.actives)
  useIsomorphicLayoutEffect(() => {
    if (Editor.isEmpty(editor, node)) {
      Placeholder.update(editor, [node, Editable.findPath(editor, node)])
      return () => {
        store.setState(({ actives }) => {
          return {
            actives: actives.filter(d => d.entry[0] !== node),
          }
        })
      }
    }
  }, [store, node, editor])

  return React.useMemo(() => {
    return actives.find(d => d.entry[0] === node)?.render
  }, [actives, node])
}
