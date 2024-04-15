import { Editor } from "./editor";

const EDITOR_TO_READONLY_WEAK_MAP = new WeakMap<Editor, boolean>()

export const Readonly = {
  isReadonly: (editor: Editor) => {
    return !!EDITOR_TO_READONLY_WEAK_MAP.get(editor)
  },
  setReadonly: (editor: Editor, readonly: boolean) => {
    EDITOR_TO_READONLY_WEAK_MAP.set(editor, readonly)
    editor.onReadonly(readonly)
  }
}
