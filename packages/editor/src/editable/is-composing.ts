import { EditableInterface } from "@/interfaces";
import { IS_COMPOSING } from "@/utils";

export const isComposing: EditableInterface['isComposing'] = (editor) => {
  return IS_COMPOSING.get(editor) || false
}
