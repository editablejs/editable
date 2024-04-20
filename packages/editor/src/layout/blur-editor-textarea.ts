import { EDITOR_TO_SHADOW, EDITOR_TO_INPUT } from "@/utils"
import { Editor } from "@/interfaces"

export const blurEditorTextarea = (editor: Editor) => {
  const shadow = EDITOR_TO_SHADOW.get(editor)
  const textarea = EDITOR_TO_INPUT.get(editor)
  if (textarea && shadow && shadow.activeElement === textarea) {
    textarea.blur()
  }
}
