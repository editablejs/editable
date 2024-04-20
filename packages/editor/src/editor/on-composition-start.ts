import { Editor, Range } from "@/interfaces";
import { IS_COMPOSING } from "@/utils";

export const onCompositionStart = (editor: Editor, data: string) => {
  if (editor.selection && Range.isExpanded(editor.selection)) {
    Editor.deleteFragment(editor)
  }
  IS_COMPOSING.set(editor, true)
}
