import { EditableInterface, Transforms } from "@/interfaces"


export const insertFile: EditableInterface['insertFile'] = (editor, file, at) => {
  if (at) {
    Transforms.select(editor, at)
  }
}
