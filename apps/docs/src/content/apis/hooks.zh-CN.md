---
id: Hooks
title: Hooks
permalink: index.html
---

## useEditable {/*use-editable*/}

`useEditable` 用于获取编辑器的实例。每次数据更新时，都会返回一个新的实例。

```tsx
const editable = useEditable();
```
## useEditableStatic {/*use-editable-static*/}

`useEditableStatic` 用于获取编辑器的静态实例。每次数据更新时，它不会变化。

```tsx
const editable = useEditableStatic();
```

## useFocused {/*use-focused*/}

`useFocused` 用于获取编辑器是否处于聚焦状态。

```tsx
const [focused, setFocused] = useFocused();
```

## useReadOnly {/*use-read-only*/}

`useReadOnly` 用于获取编辑器是否处于只读状态。

```tsx
const [readOnly, setReadOnly] = useReadOnly();
```

## useNodeSelected {/*use-node-selected*/}

`useNodeSelected` 用于获取当前节点是选中。

```tsx
const selected = useNodeSelected()
```

## useNodeFocused {/*use-node-focused*/}

`useNodeFocused` 用于获取当前节点是否处于聚焦状态。

```tsx
const focused = useNodeFocused()
```

## useGrid {/*use-grid*/}

`useGrid` 用于获取位于当前节点外的Grid节点。

```tsx
const grid = useGrid()
```

## useGridSelection {/*use-grid-selection*/}

`useGridSelection` 用于获取当前Grid节点的选区。

```tsx
const selection = useGridSelection()
```

## useGridSelectionRect {/*use-grid-selection-rect*/}

`useGridSelectionRect` 用于获取当前Grid节点的选区矩形。

```tsx
const rect = useGridSelectionRect()
```

## useGridSelected {/*use-grid-selected*/}

`useGridSelected` 用于获取当前Grid节点选中的数据

```tsx
const selected = useGridSelected()
```
