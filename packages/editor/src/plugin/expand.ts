import { Editor, createEditor as createSlateEditor, Text } from 'slate'
import { Editable } from './editable'
import { withEditable } from './with-editable'

const { marks: slateMarks } = Editor

Editor.marks = (editor: Editor): Omit<Text, 'text' | 'composition'> => {
  let marks: Omit<Text, 'text' | 'composition'> = {}
  let isEqual = true
  if (Editable.isEditor(editor)) {
    editor.normalizeSelection(selection => {
      if (!selection) return
      const editorMarks = slateMarks({ ...editor, selection })
      if (isEqual && editorMarks !== editor.marks) {
        isEqual = false
      }
      marks = Object.assign(marks, editorMarks)
    })
  } else {
    return slateMarks(editor) ?? marks
  }
  return isEqual ? editor.marks ?? {} : marks
}

export const createEditor = () => {
  return withEditable(createSlateEditor())
}

export * from 'slate'
export { Editor }
export * from '../transforms'

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
