import isHotkey, { isCodeHotkey, isKeyHotkey } from 'is-hotkey'

export * from './interfaces/cell'
export * from './interfaces/row'
export * from './interfaces/grid'

export * from './plugin/custom'

export {
  ContentEditable,
} from './components/content'
export { EditableComposer } from './components/editable'

export { useEditableStatic } from './hooks/use-editable-static'
export { useFocused } from './hooks/use-focused'
export { useReadOnly } from './hooks/use-read-only'
export { useNode } from './hooks/use-node'
export { useEditable } from './hooks/use-editable'

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
