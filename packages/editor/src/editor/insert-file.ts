import { EditorInterface, Transforms } from "@/interfaces"


export const insertFile: EditorInterface['insertFile'] = (editor, file, at) => {
  if (at) {
    Transforms.select(editor, at)
  }
}
