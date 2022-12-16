import { createEditor as createSlateEditor } from 'slate'
import { withEditable } from './with-editable'

export const createEditor = () => {
  return withEditable(createSlateEditor())
}
