import { EDITOR_TO_INPUT, EDITOR_TO_SHADOW } from "@/utils";
import { EditableInterface, Focused } from "@/interfaces";

export const blur: EditableInterface['blur'] = (editor) => {
  if (!Focused.isFocused(editor)) return
  const shadow = EDITOR_TO_SHADOW.get(editor)
  const textarea = EDITOR_TO_INPUT.get(editor)
  if (textarea && shadow && shadow.activeElement !== textarea) {
    textarea.blur()
  }
}
