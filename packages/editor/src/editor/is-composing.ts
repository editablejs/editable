import { EditorInterface } from "@/interfaces";
import { IS_COMPOSING } from "@/utils";

export const isComposing: EditorInterface['isComposing'] = (editor) => {
  return IS_COMPOSING.get(editor) || false
}
