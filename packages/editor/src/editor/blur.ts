import { EditorInterface } from "@/interfaces";
import { blurEditorTextarea } from "@/layout";

export const blur: EditorInterface['blur'] = (editor) => {
  blurEditorTextarea(editor)
}
