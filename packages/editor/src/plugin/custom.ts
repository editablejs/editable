import { Editor, createEditor as createSlateEditor, Text } from 'slate'
import { Editable } from './editable'
import { withEditable } from './with-editable'
import { Transforms } from './transforms'

const { marks: slateMarks } = Editor

Editor.marks = (editor: Editor): Omit<Text, 'text' | 'composition'> => {
  let marks: Omit<Text, 'text' | 'composition'> = {}
  if (Editable.isEditor(editor)) {
    editor.normalizeSelection(selection => {
      if (!selection) return
      const editorMarks = slateMarks({ ...editor, selection })
      marks = Object.assign(marks, editorMarks)
    })
  } else {
    return slateMarks(editor) ?? marks
  }
  return marks
}

export const createEditor = () => {
  return withEditable(createSlateEditor())
}

export { Editor, Transforms }

export * from 'slate'

export {
  Element,
  Text,
  Node,
  Range,
  RangeRef,
  Point,
  PointRef,
  Path,
  PathRef,
  Span,
  Location,
  Operation,
  Scrubber,
} from 'slate'
