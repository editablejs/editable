import { Editor, Placeholder } from "@/interfaces";

export const onFocus = (editor: Editor) => {
  Placeholder.refresh(editor)
}
