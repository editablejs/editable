import * as React from 'react'
import { Editor, Node, NodeEntry, Range } from '@editablejs/models'
import create, { UseBoundStore, StoreApi } from 'zustand'
import { Editable } from './editable'

export interface RenderPlaceholderProps {
  node: Node
}
export type PlaceholderRender = (props: RenderPlaceholderProps) => React.ReactNode

export type PlaceholderSubscribe = (entry: NodeEntry) => PlaceholderRender | void

const PLACEHOLDER_IS_ALONE = new WeakMap<PlaceholderSubscribe, boolean>()
export interface ActivePlaceholder {
  entry: NodeEntry
  alone: boolean
  render: PlaceholderRender
  placeholder: PlaceholderSubscribe
}

export interface PlaceholderStore {
  placeholders: PlaceholderSubscribe[]
  actives: ActivePlaceholder[]
}

const EDITOR_TO_PLACEHOLDER_STORE = new WeakMap<
  Editable,
  UseBoundStore<StoreApi<PlaceholderStore>>
>()

const getPlaceholderStore = (editor: Editable) => {
  let store = EDITOR_TO_PLACEHOLDER_STORE.get(editor)
  if (!store) {
    store = create<PlaceholderStore>(() => ({
      placeholders: [],
      actives: [],
    }))
    EDITOR_TO_PLACEHOLDER_STORE.set(editor, store)
  }
  return store
}

export const Placeholder = {
  getStore: getPlaceholderStore,

  isAlone: (fn: PlaceholderSubscribe) => {
    return PLACEHOLDER_IS_ALONE.get(fn) ?? false
  },

  subscribe: (editor: Editable, fn: PlaceholderSubscribe, alone = false) => {
    const store = getPlaceholderStore(editor)
    PLACEHOLDER_IS_ALONE.set(fn, alone)

    store.setState(state => ({
      placeholders: [...state.placeholders.filter(d => d !== fn), fn],
    }))

    return () => {
      store.setState(state => ({
        placeholders: state.placeholders.filter(d => d !== fn),
      }))
      PLACEHOLDER_IS_ALONE.delete(fn)
    }
  },

  update: (editor: Editable, entry: NodeEntry) => {
    const store = getPlaceholderStore(editor)
    const state = store.getState()
    let render: PlaceholderRender | null = null
    let placeholder: PlaceholderSubscribe | null = null
    const aloneActive = state.actives.find(d => d.alone && d.entry[0] === entry[0])
    if (aloneActive) {
      const r = aloneActive.placeholder(entry)
      if (r) {
        render = r
        placeholder = aloneActive.placeholder
      }
    }
    // 没有以编辑器为placeholder的情况下，才会去找其他的placeholder
    else {
      const hasEditorPlaceholder = state.actives.some(d => d.entry[0] === editor)
      const placeholders = state.placeholders.sort(a => (Placeholder.isAlone(a) ? 1 : 0))
      for (let i = placeholders.length - 1; i >= 0; i--) {
        placeholder = placeholders[i]
        if (!Placeholder.isAlone(placeholder) && hasEditorPlaceholder) continue
        const r = placeholder(entry)
        if (r) {
          render = r
          break
        }
      }
    }

    const actives = state.actives.filter(d => {
      if (!d.alone || (d.entry[0] === entry[0] && render)) return false
      return Editor.isEmpty(editor, d.entry[0])
    })

    if (render && placeholder) {
      actives.push({
        entry,
        alone: Placeholder.isAlone(placeholder),
        render,
        placeholder,
      })
    }
    store.setState({ actives })
    return render
  },

  refresh: (editor: Editable) => {
    const isReadOnly = Editable.isReadOnly(editor)
    const store = getPlaceholderStore(editor)
    if (isReadOnly) {
      store.setState({ actives: [] })
    } else if (Editor.isEmpty(editor, editor)) {
      Placeholder.update(editor, [editor, []])
    } else if (editor.selection && Range.isCollapsed(editor.selection)) {
      const nodes = Editor.nodes(editor, {
        at: editor.selection,
      })
      for (const entry of nodes) {
        if (Editor.isEmpty(editor, entry[0])) {
          return Placeholder.update(editor, entry)
        }
      }
      store.setState(({ actives }) => {
        return {
          actives: actives.filter(d => {
            if (!d.alone) return false
            return Editor.isEmpty(editor, d.entry[0])
          }),
        }
      })
    } else {
      store.setState(({ actives }) => ({
        actives: actives.filter(d => d.alone),
      }))
    }
  },
}
