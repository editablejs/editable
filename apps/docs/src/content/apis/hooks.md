---
id: Hooks
title: Hooks
permalink: index.html
---

## useEditable {/*use-editable*/}

`useEditable` is used to get the instance of the editor. It returns a new instance every time data updates.

```tsx
const editable = useEditable();
```
## useEditableStatic {/*use-editable-static*/}

`useEditableStatic` is used to get the static instance of the editor. It does not change when data updates.

## useFocused {/*use-focused*/}

`useFocused` is used to determine if the editor is currently focused.

```tsx
const [focused, setFocused] = useFocused();
```

## useReadOnly {/*use-read-only*/}

`useReadOnly` is used to determine if the editor is currently in read-only mode.

```tsx
const [readOnly, setReadOnly] = useReadOnly();
```

## useNodeSelected {/*use-node-selected*/}

`useNodeSelected` is used to determine if the current node is selected.

```tsx
const selected = useNodeSelected()
```

## useNodeFocused {/*use-node-focused*/}

`useNodeFocused` is used to determine if the current node is currently focused.

```tsx
const focused = useNodeFocused()
```

## useGrid {/*use-grid*/}

`useGrid` is used to obtain the Grid node outside of the current node.

```tsx
const grid = useGrid()
```

## useGridSelection {/*use-grid-selection*/}

`useGridSelection` is used to obtain the selection of the current Grid node.

```tsx
const selection = useGridSelection()
```

## useGridSelectionRect {/*use-grid-selection-rect*/}

`useGridSelectionRect` is used to obtain the selection rectangle of the current Grid node.

```tsx
const rect = useGridSelectionRect()
```

## useGridSelected {/*use-grid-selected*/}

`useGridSelected` is used to obtain the selected data of the current Grid node.

```tsx
const selected = useGridSelected()
```
