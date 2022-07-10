// Components
// Environment-dependent Editable
import { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from './components/content'

export type {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
}

export {
  ContentEditable,
  DefaultPlaceholder,
} from './components/content'
export { DefaultElement } from './components/element'
export { DefaultLeaf } from './components/leaf'
export { Slate } from './components/slate'

// Hooks
export { useEditor } from './hooks/use-editor'
export { useSlateStatic } from './hooks/use-slate-static'
export { useFocused } from './hooks/use-focused'
export { useReadOnly } from './hooks/use-read-only'
export { useSelected } from './hooks/use-selected'
export { useSlate } from './hooks/use-slate'
export { useSlateSelector } from './hooks/use-slate-selector'

// Plugin
export { EditableEditor } from './plugin/editable-editor'
export { withEditable } from './plugin/with-editable'
