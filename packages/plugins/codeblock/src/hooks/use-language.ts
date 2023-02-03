import { Editor } from '@editablejs/models'
import { EditorView } from '@codemirror/view'

import { getOptions } from '../options'
import { useExtension } from './use-extension'

export function useLanguage(view: EditorView | null, editor: Editor, language?: string) {
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
