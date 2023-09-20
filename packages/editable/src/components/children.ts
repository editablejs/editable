import { Editor } from "@editablejs/models"
import { Editable } from "../plugin/editable"
import { createNode } from "./node"
import { updateText } from "./text"
import { NODE_TO_PATH } from "../utils/weak-maps"

export interface CreateChildrenOptions {

}

export const createChildren = (editor: Editable, options: CreateChildrenOptions) => {
  editor.on('change', () => {
    for (const operation of editor.operations) {
      switch (operation.type) {
        case 'insert_text':
          const entry = Editor.node(editor, operation.path)
          updateText(editor, entry as any)
          break
      }
    }
  })
  NODE_TO_PATH.set(editor, [])
  return createNode(editor, { node: editor, selection: editor.selection })
}
