import { Editor } from "@editablejs/models"
import { Editable } from "../plugin/editable"
import { createNode } from "./node"
import { updateText } from "./text"

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

  return createNode(editor, { node: editor, selection: editor.selection })
}
