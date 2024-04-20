import { Editor } from "@/interfaces";
import { EDITOR_TO_INPUT, EDITOR_TO_SHADOW } from "@/utils";

export const focusEditorTextarea = (editor: Editor) => {
  const shadow = EDITOR_TO_SHADOW.get(editor)
  const textarea = EDITOR_TO_INPUT.get(editor)
  if (textarea && shadow && shadow.activeElement !== textarea) {
    textarea.focus({ preventScroll: true })
  }
}
