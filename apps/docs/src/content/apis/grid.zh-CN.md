---
id: Models
title: Grid Models
permalink: index.html
---

## GridCell {/*grid-cell*/}

定义了Grid单元格的基本属性和方法

```ts
interface GridBaseCell extends Element {
  type: string
  colspan?: number
  rowspan?: number
  span?: CellPoint
}

interface GridCell extends GridBaseCell {
  colspan: number
  rowspan: number
}
```

### find {/*grid-cell-find*/}

在当前单元格向上查找符合条件的单元格节点

```ts
find: (editor: Editor, at?: Location): NodeEntry<GridCell> | undefined
```

#### 参数 {/*grid-cell-find-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `at`：`Location`类型，可选参数，要查找的位置，默认为当前光标所在位置。

#### 返回值 {/*grid-cell-find-return*/}
- `NodeEntry<GridCell>`类型或`undefined`，返回找到的单元格节点或者`undefined`。

### create {/*grid-cell-create*/}

创建一个单元格节点

```ts
create: <C extends GridCell>(cell: Partial<C> = {}): C
```

#### 参数 {/*grid-cell-create-params*/}
- `cell`：`Partial<C>`类型，可选参数，单元格节点的属性。

#### 返回值 {/*grid-cell-create-return*/}
- `C`类型，返回创建的单元格节点。

### equal {/*grid-cell-equal*/}

判断两个单元格是否相等

```ts
equal: (a: CellPoint, b: CellPoint) => boolean
```

#### 参数 {/*grid-cell-equal-params*/}
- `a`：`CellPoint`类型，单元格节点。
- `b`：`CellPoint`类型，单元格节点。

#### 返回值 {/*grid-cell-equal-return*/}
- `boolean`类型，返回两个单元格是否相等。

### focus {/*grid-cell-focus*/}

将光标定位到当前单元格

```ts
focus: (editor: Editor, path: Path, edge: SelectionEdge = 'start') => void
```

#### 参数 {/*grid-cell-focus-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `path`：`Path`类型，单元格节点的路径。
- `edge`：`SelectionEdge`类型，可选参数，光标的位置，默认为`start`。

### edges {/*grid-cell-edges*/}

获取当前单元格的边界

```ts
edges: (selection: { start: CellPoint, end: CellPoint }) => { start: CellPoint; end: CellPoint }
```

#### 参数 {/*grid-cell-edges-params*/}
- `selection`：`{ start: CellPoint, end: CellPoint }`类型，单元格节点的路径。

#### 返回值 {/*grid-cell-edges-return*/}
- `{ start: CellPoint; end: CellPoint }`类型，返回当前单元格的边界。

### toPoint {/*grid-cell-to-point*/}

将单元格节点转换为单元格坐标

```ts
toPoint: (path: Path): CellPoint
```

#### 参数 {/*grid-cell-to-point-params*/}
- `path`：`Path`类型，单元格节点的路径。

#### 返回值 {/*grid-cell-to-point-return*/}

- `CellPoint`类型，返回单元格坐标。

### isSpan {/*grid-cell-is-span*/}

判断当前单元格是否为合并单元格

```ts
isSpan: (cell: GridBaseCell): cell is GridSpanCell
```

#### 参数 {/*grid-cell-is-span-params*/}

- `cell`：`GridBaseCell`类型，单元格节点。

#### 返回值 {/*grid-cell-is-span-return*/}

- `cell is GridSpanCell`类型，返回当前单元格是否为合并单元格。

## GridRow {/*grid-row*/}

定义了Grid行的基本属性和方法

```ts
interface GridRow extends Element {
  type: string
  children: GridCell[]
  height?: number
}
```

### create {/*grid-row-create*/}

创建一个Grid行节点

```ts
create: <R extends GridRow, C extends GridCell>(row: Partial<Omit<R, 'children'>> = {}, cells: Partial<C>[],): R
```

#### 参数 {/*grid-row-create-params*/}

- `row`：`Partial<Omit<R, 'children'>>`类型，可选参数，Grid行节点的属性。
- `cells`：`Partial<C>[]`类型，单元格节点的属性。

#### 返回值 {/*grid-row-create-return*/}

- `R`类型，返回创建的Grid行节点。

## Grid {/*grid*/}

定义了Grid的基本属性和方法

```ts
interface Grid extends Element {
  colsWidth?: number[]
  children: GridRow[]
}
```

### above {/*grid-above*/}

向上查找符合条件的Grid节点

```ts
above: (editor: Editor, at?: GridLocation): NodeEntry<Grid> | undefined
```

#### 参数 {/*grid-above-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，可选参数，要查找的位置，默认为当前光标所在位置。

#### 返回值 {/*grid-above-return*/}

- `NodeEntry<Grid>`类型或`undefined`，返回找到的Grid节点或者`undefined`。

### getSelection {/*grid-get-selection*/}

获取当前Gird的选区

```ts
getSelection: (editor: Editor, at?: GridLocation): GridSelection | undefined
```

#### 参数 {/*grid-get-selection-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，可选参数，要查找的位置，默认为当前光标所在位置。

#### 返回值 {/*grid-get-selection-return*/}

- `GridSelection`类型或`undefined`，返回当前Gird的选区或者`undefined`。

### getSelected {/*grid-get-selected*/}

获取当前Gird的选中区域数据

```ts
getSelected: (editor: Editor, at?: GridLocation, selection?: GridSelection): GridSelected | undefined
```

#### 参数 {/*grid-get-selected-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，可选参数，要查找的位置，默认为当前光标所在位置。
- `selection`：`GridSelection`类型，可选参数，当前Gird的选区。

#### 返回值 {/*grid-get-selected-return*/}

- `GridSelected`类型或`undefined`，返回当前Gird的选中区域数据或者`undefined`。

### getFragment {/*grid-get-fragment*/}

获取当前Gird的选中区域的片段

```ts
getFragment: (editor: Editor, at?: GridLocation, selection?: GridSelection): Grid | undefined
```

#### 参数 {/*grid-get-fragment-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，可选参数，要查找的位置，默认为当前光标所在位置。
- `selection`：`GridSelection`类型，可选参数，当前Gird的选区。

#### 返回值 {/*grid-get-fragment-return*/}

- `Grid`类型或`undefined`，返回当前Gird的选中区域的片段或者`undefined`。

### create {/*grid-create*/}

创建一个Grid节点

```ts
create: <G extends Grid, R extends GridRow, C extends GridCell>(grid: Partial<Omit<G, 'children'>>, ...rows: (Omit<R, 'children'> & Record<'children', C[]>)[]): G
```

#### 参数 {/*grid-create-params*/}

- `grid`：`Partial<Omit<G, 'children'>>`类型，可选参数，Grid节点的属性。
- `...rows`：`(Omit<R, 'children'> & Record<'children', C[]>)[]`类型，Grid行节点的属性。

#### 返回值 {/*grid-create-return*/}

- `G`类型，返回创建的Grid节点。

### remove {/*grid-remove*/}

删除Grid节点

```ts
remove: (editor: Editor, at: GridLocation): void
```

#### 参数 {/*grid-remove-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，要删除的位置。

### removeCol {/*grid-remove-col*/}

删除Grid节点的列

```ts
removeCol: (editor: Editor, at: GridLocation, index: number): void
```

#### 参数 {/*grid-remove-col-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，要删除的位置。
- `index`：`number`类型，要删除的列的索引。

### removeRow {/*grid-remove-row*/}

删除Grid节点的行

```ts
removeRow: (editor: Editor, at: GridLocation, index: number): void
```

#### 参数 {/*grid-remove-row-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，要删除的位置。
- `index`：`number`类型，要删除的行的索引。

### getRangeOfMoveCol {/*grid-get-range-of-move-col*/}

获取移动Grid节点列的范围

```ts
getRangeOfMoveCol: (editor: Editor, options: GridMoveOptions): GridMoveRange | undefined
```

#### 参数 {/*grid-get-range-of-move-col-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `options`：`GridMoveOptions`类型，移动Grid节点列的配置。

#### 返回值 {/*grid-get-range-of-move-col-return*/}

- `GridMoveRange`类型或`undefined`，返回移动Grid节点列的范围或者`undefined`。

### moveCol {/*grid-move-col*/}

移动Grid节点的列

```ts
moveCol: (editor: Editor, options: GridMoveOptions): void
```

#### 参数 {/*grid-move-col-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `options`：`GridMoveOptions`类型，移动Grid节点列的配置。

### getRangeOfMoveRow {/*grid-get-range-of-move-row*/}

获取移动Grid节点行的范围

```ts
getRangeOfMoveRow: (editor: Editor, options: GridMoveOptions): GridMoveRange | undefined
```

#### 参数 {/*grid-get-range-of-move-row-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `options`：`GridMoveOptions`类型，移动Grid节点行的配置。

#### 返回值 {/*grid-get-range-of-move-row-return*/}

- `GridMoveRange`类型或`undefined`，返回移动Grid节点行的范围或者`undefined`。

### moveRow {/*grid-move-row*/}

移动Grid节点的行

```ts
moveRow: (editor: Editor, options: GridMoveOptions): void
```

#### 参数 {/*grid-move-row-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `options`：`GridMoveOptions`类型，移动Grid节点行的配置。

### insertCol {/*grid-insert-col*/}

在Grid节点的指定位置插入列

```ts
insertCol: <C extends GridCell>(editor: Editor, at: GridLocation, index: number, cell: Partial<Omit<C, 'children'>>, width?: number, minWidth: number = 5): void
```

#### 参数 {/*grid-insert-col-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，要插入的位置。
- `index`：`number`类型，要插入的列的索引。
- `cell`：`Partial<Omit<C, 'children'>>`类型，要插入的列的属性。
- `width`：`number`类型，可选参数，要插入的列的宽度，默认为`undefined`。
- `minWidth`：`number`类型，可选参数，要插入的列的最小宽度，默认为`5`。

### insertRow {/*grid-insert-row*/}

在Grid节点的指定位置插入行

```ts
insertRow: <R extends GridRow, C extends GridCell>(editor: Editor, at: GridLocation, index: number, row: Partial<Omit<R, 'children'>>, cell: Partial<Omit<C, 'children'>>, height?: number): void
```

#### 参数 {/*grid-insert-row-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，要插入的位置。
- `index`：`number`类型，要插入的行的索引。
- `row`：`Partial<Omit<R, 'children'>>`类型，要插入的行的属性。
- `cell`：`Partial<Omit<C, 'children'>>`类型，要插入的行的列的属性。
- `height`：`number`类型，可选参数，要插入的行的高度，默认为`undefined`。

### canMerge {/*grid-can-merge*/}

判断Grid节点的指定位置是否可以合并

```ts
canMerge: (editor: Editor, at?: GridLocation): boolean
```

#### 参数 {/*grid-can-merge-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，可选参数，要判断的位置，默认为当前光标所在位置。

#### 返回值 {/*grid-can-merge-return*/}

- `boolean`类型，返回是否可以合并。

### mergeCell {/*grid-merge-cell*/}

合并Grid节点的指定位置的单元格

```ts
mergeCell: (editor: Editor, at?: GridLocation, selection?: GridSelection): void
```

#### 参数 {/*grid-merge-cell-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，可选参数，要合并的位置，默认为当前光标所在位置。
- `selection`：`GridSelection`类型，可选参数，当前Gird的选区。

### canSplit {/*grid-can-split*/}

判断Grid节点的指定位置是否可以拆分

```ts
canSplit: (editor: Editor, at?: GridLocation): boolean
```

#### 参数 {/*grid-can-split-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，可选参数，要判断的位置，默认为当前光标所在位置。

#### 返回值 {/*grid-can-split-return*/}

- `boolean`类型，返回是否可以拆分。

### splitCell {/*grid-split-cell*/}

拆分Grid节点的指定位置的单元格

```ts
splitCell: (editor: Editor, at?: GridLocation, selection?: GridSelection): void
```

#### 参数 {/*grid-split-cell-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，可选参数，要拆分的位置，默认为当前光标所在位置。

### cells {/*grid-cells*/}

获取Grid节点的所有单元格

```ts
cells: (editor: Editor, at?: GridLocation, opitons: GridGeneratorCellsOptions = {}): Generator<[GridCell, number, number]>
```

#### 参数 {/*grid-cells-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，可选参数，要获取的位置，默认为当前光标所在位置。
- `options`：`GridGeneratorCellsOptions`类型，可选参数，获取单元格的配置，默认为`{}`。

#### 返回值 {/*grid-cells-return*/}

- `Generator<[GridCell, number, number]>`类型，返回Grid节点的所有单元格。

### span {/*grid-span*/}

如果选区中的开始或结束位置处于被合并的单元格，就把选区边界定位在最终合并的单元格内

```ts
span: (editor: Editor, at: GridLocation, selection: GridSelection): { start: CellPoint; end: CellPoint }
```

#### 参数 {/*grid-span-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，要获取的位置。
- `selection`：`GridSelection`类型，当前Gird的选区。

#### 返回值 {/*grid-span-return*/}

- `{ start: CellPoint; end: CellPoint }`类型，返回选区边界定位在最终合并的单元格内。

### edges {/*grid-edges*/}

获取Grid节点的所有边界

```ts
edges: (editor: Editor, at: GridLocation, selection?: GridSelection): GridSelection
```

#### 参数 {/*grid-edges-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，要获取的位置。
- `selection`：`GridSelection`类型，可选参数，当前Gird的选区，默认为`undefined`。

#### 返回值 {/*grid-edges-return*/}

- `GridSelection`类型，返回Grid节点的所有边界。

### focus {/*grid-focus*/}

聚焦到Grid节点

```ts
focus: (editor: Editor, options: {point: CellPoint, at?: GridLocation, edge?: SelectionEdge}): void
```

#### 参数 {/*grid-focus-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `options`：`{point: CellPoint, at?: GridLocation, edge?: SelectionEdge}`类型，聚焦到Grid节点的配置。

### select {/*grid-select*/}

选中Grid节点

```ts
select: (editor: Editor, at: GridLocation, selection: Partial<GridSelection> = {}) => void
```

#### 参数 {/*grid-select-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，要选中的位置。
- `selection`：`Partial<GridSelection>`类型，可选参数，当前Gird的选区，默认为`{}`。

### getCell {/*grid-get-cell*/}

获取Grid节点的指定位置的单元格

```ts
getCell: (editor: Editor, at: GridLocation, point: CellPoint): NodeEntry<GridCell> | undefined
```

#### 参数 {/*grid-get-cell-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，要获取的位置。
- `point`：`CellPoint`类型，要获取的单元格的位置。

#### 返回值 {/*grid-get-cell-return*/}

- `NodeEntry<GridCell> | undefined`类型，返回Grid节点的指定位置的单元格。

### getRowCount {/*grid-get-row-count*/}

获取Grid节点的行数

```ts
getRowCount: (editor: Editor, at: GridLocation): number
```

#### 参数 {/*grid-get-row-count-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，要获取的位置。

#### 返回值 {/*grid-get-row-count-return*/}

- `number`类型，返回Grid节点的行数。

### getColCount {/*grid-get-col-count*/}

获取Grid节点的列数

```ts
getColCount: (editor: Editor, at: GridLocation): number
```

#### 参数 {/*grid-get-col-count-params*/}

- `editor`：`Editor`类型，编辑器对象。
- `at`：`GridLocation`类型，要获取的位置。

#### 返回值 {/*grid-get-col-count-return*/}

- `number`类型，返回Grid节点的列数。
