import { Transforms } from '../interfaces/transforms'
import { EditorInterface } from '../interfaces/editor'
import { List, Range, Editor } from '@/interfaces'

export const insertBreak: EditorInterface['insertBreak'] = editor => {
  const { selection } = editor

  if (!selection || Range.isExpanded(selection) || !List.above(editor)) {
    Transforms.splitNodes(editor, { always: true })
    return
  }
  List.splitList(editor)
}
