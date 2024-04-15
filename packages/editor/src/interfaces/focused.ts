import { Editor } from "./editor";

const EDITOR_TO_FOCUSED_WEAK_MAP = new WeakMap<Editor, boolean>()

export const Focused = {
  isFocused: (editor: Editor) => {
    return EDITOR_TO_FOCUSED_WEAK_MAP.get(editor) || false
  },
  setFocused: (editor: Editor, focused: boolean) => {
    EDITOR_TO_FOCUSED_WEAK_MAP.set(editor, focused)
    if (focused) {
      editor.onFocus()
    } else {
      editor.onBlur()
    }
  }
}
