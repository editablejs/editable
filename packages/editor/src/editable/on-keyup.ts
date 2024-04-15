import { Editor } from "@/interfaces";
import { IS_SHIFT_PRESSED } from "@/utils";

export const onKeyup = (editor: Editor, event: KeyboardEvent) => {
  if (event.key.toLowerCase() === 'shift') {
    IS_SHIFT_PRESSED.set(editor, false)
  }
}
