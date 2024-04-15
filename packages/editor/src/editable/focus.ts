import { EditableInterface, Editor, Focused, Transforms } from "@/interfaces";
import { EDITOR_TO_INPUT, EDITOR_TO_SHADOW } from "@/utils";

export const focus: EditableInterface['focus'] = (editor, start) => {
  if (Focused.isFocused(editor)) return
  const path = Editor.findPath(editor, editor)
  if (!editor.selection) {
    const point = start ? Editor.start(editor, path) : Editor.end(editor, path)
    Transforms.select(editor, point)
  } else if (start === true) {
    Transforms.select(editor, Editor.start(editor, path))
  } else if (start === false) {
    Transforms.select(editor, Editor.end(editor, path))
  }

  const shadow = EDITOR_TO_SHADOW.get(editor)
  const textarea = EDITOR_TO_INPUT.get(editor)
  if (textarea && shadow && shadow.activeElement !== textarea) {
    textarea.focus({ preventScroll: true })
  }
}
