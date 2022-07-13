import { createContext, useContext } from 'react'
import { EditableEditor } from '../plugin/editable-editor'

/**
 * A React context for sharing the editor object.
 */

export const EditorContext = createContext<EditableEditor | null>(null)

/**
 * Get the current editor object from the React context.
 */

export const useSlateStatic = (): EditableEditor => {
  const editor = useContext(EditorContext)

  if (!editor) {
    throw new Error(
      `The \`useSlateStatic\` hook must be used inside the <Slate> component's context.`
    )
  }

  return editor
}
