import isHotkey, { isCodeHotkey, isKeyHotkey } from 'is-hotkey';

export * from './interfaces/cell';
export * from './interfaces/row';
export * from './interfaces/grid';

export * from './plugin/custom';

// Locale
export * from './hooks/use-locale';

export { ContentEditable } from './components/content';
export { EditableComposer } from './components/editable';

export { useIsomorphicLayoutEffect } from './hooks/use-isomorphic-layout-effect';
export { useEditableStatic } from './hooks/use-editable-static';
export { useFocused } from './hooks/use-focused';
export { useReadOnly } from './hooks/use-read-only';
export { useNodeSelected } from './hooks/use-node-selected';
export { useNodeFocused } from './hooks/use-node-focused';
export { useEditable } from './hooks/use-editable';

// Grid
export { useGrid } from './hooks/use-grid';
export { useGridSelection } from './hooks/use-grid-selection';
export { useGridSelectionRect } from './hooks/use-grid-selection-rect';
export { useGridSelected } from './hooks/use-grid-selected';

// Plugin
export { Editable } from './plugin/editable';
export { withEditable } from './plugin/with-editable';

export type {
  RenderElementProps,
  RenderLeafProps,
  RenderElementAttributes,
  RenderLeafAttributes,
  ElementAttributes,
  NodeAttributes,
  TextAttributes,
  PlaceholderAttributes,
} from './plugin/editable';

export {
  useCancellablePromises,
  cancellablePromise,
} from './hooks/use-cancellable-promises';

export { isHotkey, isCodeHotkey, isKeyHotkey };
