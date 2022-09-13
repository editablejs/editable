import { createContext, useContext } from 'react'
import { Editable } from '../plugin/editable'

/**
 * A React context for sharing the editor object.
 */

export const EditorContext = createContext<Editable | null>(null)

/**
 * Get the current editor object from the React context.
 */

export const useEditableStatic = (): Editable => {
  const editor = useContext(EditorContext)

  if (!editor) {
    throw new Error(
      `The \`useEditableStatic\` hook must be used inside the <Slate> component's context.`,
    )
  }

  return editor
}
