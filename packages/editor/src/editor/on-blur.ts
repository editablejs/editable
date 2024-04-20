import { Editor, Placeholder } from "@/interfaces";

export const onBlur = (editor: Editor) => {
  Placeholder.refresh(editor)
}
