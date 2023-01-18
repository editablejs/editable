import { Editable } from '@editablejs/editor'
import { EditorView } from '@codemirror/view'

import { getOptions } from '../options'
import { useExtension } from './use-extension'
import { MutableRefObject } from 'react'

export function useLanguage(
  view: MutableRefObject<EditorView | null>,
  editor: Editable,
  language?: string,
) {
  return useExtension(
    view,
    () => {
      const { languages } = getOptions(editor)
      if (!languages || !language) return []
      const l = languages.find(l => l.value === language)
      if (!l?.plugin) return []
      return l.plugin
    },
    [editor, language],
  )
}
