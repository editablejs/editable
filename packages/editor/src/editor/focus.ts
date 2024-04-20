import { EditorInterface, Editor, Transforms } from "@/interfaces";
import { focusEditorTextarea } from "@/layout";

export const focus: EditorInterface['focus'] = (editor, start) => {
  const path = Editor.findPath(editor, editor)
  if (!editor.selection) {
    const point = start ? Editor.start(editor, path) : Editor.end(editor, path)
    Transforms.select(editor, point)
  } else if (start === true) {
    Transforms.select(editor, Editor.start(editor, path))
  } else if (start === false) {
    Transforms.select(editor, Editor.end(editor, path))
  }
  focusEditorTextarea(editor)
}
