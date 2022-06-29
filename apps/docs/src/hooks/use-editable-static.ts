import { EditableInterface } from "@editablejs/core";
import { createContext, useContext } from "react";

export const EditableContext = createContext<EditableInterface | null>(null)

export const useEditableStatic = (): EditableInterface => {
  const editor = useContext(EditableContext)

  if (!editor) {
    throw new Error(
      `The \`useEditableStatic\` hook must be used inside the <Editable> component's context.`
    )
  }

  return editor
}
