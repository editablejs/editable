// Components
// Environment-dependent Editable
import isHotkey, { isCodeHotkey, isKeyHotkey } from 'is-hotkey'

export {
  ContentEditable,
} from './components/content'
export { Slate } from './components/slate'

// Hooks
export { useEditor } from './hooks/use-editor'
export { useSlateStatic } from './hooks/use-slate-static'
export { useFocused } from './hooks/use-focused'
export { useReadOnly } from './hooks/use-read-only'
export { useSelected } from './hooks/use-selected'
export { useSlate } from './hooks/use-slate'

// Plugin
export { EditableEditor } from './plugin/editable-editor'
export { withEditable } from './plugin/with-editable'

export type {
  RenderElementProps,
  RenderLeafProps,
} from './plugin/editable-editor'

export {
  isHotkey,
  isCodeHotkey,
  isKeyHotkey
} 
