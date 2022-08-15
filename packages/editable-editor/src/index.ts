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
export { Editable } from './plugin/editable'
export { withEditable } from './plugin/with-editable'

export type {
  RenderElementProps,
  RenderLeafProps,
  RenderElementAttributes,
  RenderLeafAttributes,
  ElementAttributes,
  NodeAttributes,
  TextAttributes,
  PlaceholderAttributes
} from './plugin/editable'

export { useCancellablePromises, cancellablePromise } from './hooks/use-cancellable-promises'

export {
  isHotkey,
  isCodeHotkey,
  isKeyHotkey
} 