import { Transforms } from '../interfaces/transforms'
import { EditorInterface } from '../interfaces/editor'

export const insertText: EditorInterface['insertText'] = (
  editor,
  text,
  options = {}
) => {
  const { selection } = editor

  if (selection) {
    const marks = editor.getMarks(options.at)
    if (marks) {
      const node = { text, ...marks }
      Transforms.insertNodes(editor, node, {
        at: options.at,
        voids: options.voids,
      })
    } else {
      Transforms.insertText(editor, text, options)
    }
  }
}
