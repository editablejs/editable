import * as React from 'react'
import { Node } from '@editablejs/models'
import { useStore } from 'zustand'
import { Placeholder } from '../plugin/placeholder'
import { useEditableStatic } from './use-editable'

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
  const store = usePlaceholderStore()
  const activePlaceholders = useStore(store, state => state.activePlaceholders)
  return React.useMemo(() => {
    return activePlaceholders.find(d => d.node === node)?.render
  }, [activePlaceholders, node])
}
