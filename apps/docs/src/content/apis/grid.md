---
id: Models
title: Grid Models
permalink: index.html
---

## GridCell {/*gird-cell*/}

Defines the basic properties and methods of a grid cell.

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

### find {/*gird-cell-find*/}

Searches for the cell node that meets the conditions in the current cell and above.

```ts
find: (editor: Editor, at?: Location): NodeEntry<GridCell> | undefined
```

#### Parameters {/*gird-cell-find-parameters*/}
- `editor`: Type `Editor`, the editor object.
- `at`: Type `Location`, optional parameter, the location to search for, defaults to the current cursor location.

#### Returns {/*gird-cell-find-returns*/}
- Type `NodeEntry<GridCell>` or `undefined`, returns the found cell node or `undefined`.

### create {/*gird-cell-create*/}

Creates a cell node.

```ts
create: <C extends GridCell>(cell: Partial<C> = {}): C
```

#### Parameters {/*gird-cell-create-parameters*/}
- `cell`: Type `Partial<C>`, optional parameter, the properties of the cell node.

#### Returns {/*gird-cell-create-returns*/}
- Type `C`, returns the created cell node.

### equal {/*gird-cell-equal*/}

Checks if two cells are equal.

```ts
equal: (a: CellPoint, b: CellPoint) => boolean
```

#### Parameters {/*gird-cell-equal-parameters*/}
- `a`: Type `CellPoint`. The first cell to compare.
- `b`: Type `CellPoint`. The second cell to compare.

#### Returns {/*gird-cell-equal-returns*/}
- Type `boolean`. Returns whether the two cells are equal.

### focus {/*gird-cell-focus*/}

Sets the editor selection to the given cell.

```ts
focus: (editor: Editor, path: Path, edge: SelectionEdge = 'start') => void
```

#### Parameters {/*gird-cell-focus-parameters*/}
- `editor`: Type `Editor`, the editor object.
- `path`:  Type `Path`, the path of the cell node.
- `edge` (optional): Type `SelectionEdge`, the position of the cursor, defaults to `'start'`.

### edges {/*gird-cell-edges*/}

Gets the boundaries of the current cell.

```ts
edges: (selection: { start: CellPoint, end: CellPoint }) => { start: CellPoint; end: CellPoint }
```

#### Parameters {/*gird-cell-edges-parameters*/}
- `selection`: `Type { start: CellPoint, end: CellPoint }`, the path of the cell node.

#### Returns {/*gird-cell-edges-returns*/}
- `{ start: CellPoint; end: CellPoint }`, indicating the boundaries of the current cell.

### toPoint {/*gird-cell-topoint*/}

Converts the cell node to cell coordinates.

```ts
toPoint: (path: Path): CellPoint
```

#### Parameters {/*gird-cell-topoint-parameters*/}
- `path`:  Type `Path`, the path of the cell node.

#### Returns {/*gird-cell-topoint-returns*/}

- `CellPoint`, indicating the cell coordinates.

### isSpan {/*gird-cell-isspan*/}

Determines whether the current cell is a merged cell.

```ts
isSpan: (cell: GridBaseCell): cell is GridSpanCell
```

#### Parameters {/*gird-cell-isspan-parameters*/}

- `cell`: Type `GridBaseCell`, the cell node.

#### Returns {/*gird-cell-isspan-returns*/}

- `cell is GridSpanCell`, indicating whether the current cell is a merged cell.

## GridRow {/*grid-row*/}

Defines the basic properties and methods of a Grid row.

```ts
interface GridRow extends Element {
  type: string
  children: GridCell[]
  height?: number
}
```

### create {/*grid-row-create*/}

Creates a new Grid row element.

```ts
create: <R extends GridRow, C extends GridCell>(row: Partial<Omit<R, 'children'>> = {}, cells: Partial<C>[],): R
```

#### Parameters {/*grid-row-create-parameters*/}

- `row`: `Partial<Omit<R, 'children'>>` type, optional parameter that defines the Grid row's properties.
- `cells`: `Partial<C>[]` type, array of partial Grid cell objects.

#### Returns {/*grid-row-create-returns*/}

- `R` type, the newly created Grid row element.

## Grid {/*grid*/}

Defines the basic properties and methods of a Grid.

```ts
interface Grid extends Element {
  colsWidth?: number[]
  children: GridRow[]
}
```

### above {/*grid-above*/}

Finds the Grid node above the current cursor position that matches the given criteria.

```ts
above: (editor: Editor, at?: GridLocation): NodeEntry<Grid> | undefined
```

#### Parameters {/*grid-above-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: `GridLocation` type, optional parameter that defines the search location. Defaults to the current cursor position.

#### Returns {/*grid-above-returns*/}

- `NodeEntry<Grid>` type or `undefined`, the Grid node found or `undefined`.

### getSelection {/*grid-getselection*/}

Gets the current selection of the Grid.

```ts
getSelection: (editor: Editor, at?: GridLocation): GridSelection | undefined
```

#### Parameters {/*grid-getselection-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: `GridLocation` type, optional parameter that defines the search location. Defaults to the current cursor position.

#### Returns  {/*grid-getselection-returns*/}

- `GridSelection` type or `undefined`, the current selection of the Grid or `undefined`.

### getSelected {/*grid-getselected*/}

Gets the selected area data of the current Grid.

```ts
getSelected: (editor: Editor, at?: GridLocation, selection?: GridSelection): GridSelected | undefined
```

#### Parameters {/*grid-getselected-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: `GridLocation` type, optional parameter that defines the search location. Defaults to the current cursor position.
- `selection`: `GridSelection` type, optional parameter that defines the Grid selection.

#### Returns {/*grid-getselected-returns*/}

- `GridSelected` type or `undefined`, the selected area data of the current Grid or `undefined`.

### getFragment {/*grid-getfragment*/}

Get the selected fragment of the current Grid.

```ts
getFragment: (editor: Editor, at?: GridLocation, selection?: GridSelection): Grid | undefined
```

#### Parameters {/*grid-getfragment-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: `GridLocation` type, optional parameter that defines the search location. Defaults to the current cursor position.
- `selection`: Optional parameter of type `GridSelection`, the current selection of the Grid.

#### Returns {/*grid-getfragment-returns*/}

- Returns a `Grid` object or `undefined`, representing the selected fragment of the current Grid.

### create {/*grid-create*/}

Create a new Grid node.

```ts
create: <G extends Grid, R extends GridRow, C extends GridCell>(grid: Partial<Omit<G, 'children'>>, ...rows: (Omit<R, 'children'> & Record<'children', C[]>)[]): G
```

#### Parameters {/*grid-create-parameters*/}

- `grid`: Optional parameter of type `Partial<Omit<G, 'children'>>`, representing the attributes of the Grid node.
- `...rows`: Rest parameter of type `(Omit<R, 'children'> & Record<'children', C[]>)[]`, representing the attributes of the Grid row nodes.

#### Returns {/*grid-create-returns*/}

- Returns a `G` object, representing the newly created Grid node.

### remove {/*grid-remove*/}

Remove a Grid node.

```ts
remove: (editor: Editor, at: GridLocation): void
```

#### Parameters {/*grid-remove-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: Type `GridLocation`, the location to remove.

### removeCol {/*grid-removecol*/}

Remove a column of a Grid node.

```ts
removeCol: (editor: Editor, at: GridLocation, index: number): void
```

#### Parameters {/*grid-removecol-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: Type `GridLocation`, the location to remove.
- `index`: Type `number`, the index of the column to remove.

### removeRow {/*grid-removerow*/}

Remove a row of a Grid node.

```ts
removeRow: (editor: Editor, at: GridLocation, index: number): void
```

#### Parameters {/*grid-removerow-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: Type `GridLocation`, the location to remove.
- `index`: Type `number`, the index of the row to remove.

### getRangeOfMoveCol {/*grid-getrangeofmovecol*/}

Get the range of columns to move for a Grid node.

```ts
getRangeOfMoveCol: (editor: Editor, options: GridMoveOptions): GridMoveRange | undefined
```

#### Parameters {/*grid-getrangeofmovecol-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `options`: Type `GridMoveOptions`, the configuration for moving columns in a Grid node.

#### Returns {/*grid-getrangeofmovecol-returns*/}

- Returns a `GridMoveRange` object or `undefined`, representing the range of columns to move.

### moveCol {/*grid-movecol*/}

Move a column of a Grid node.

```ts
moveCol: (editor: Editor, options: GridMoveOptions): void
```

#### Parameters {/*grid-movecol-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `options`: Type `GridMoveOptions`, the configuration for moving columns in a Grid node.

### getRangeOfMoveRow {/*grid-getrangeofmoverow*/}

Get the range of moving rows for the Grid node.

```ts
getRangeOfMoveRow: (editor: Editor, options: GridMoveOptions): GridMoveRange | undefined
```

#### Parameters {/*grid-getrangeofmoverow-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `options`: `GridMoveOptions` type, the configuration for moving Grid rows.

#### Returns {/*grid-getrangeofmoverow-returns*/}

- `GridMoveRange` type or `undefined`, returns the range of moving Grid rows or `undefined`.

### moveRow {/*grid-moverow*/}

Move the rows of the Grid node.

```ts
moveRow: (editor: Editor, options: GridMoveOptions): void
```

#### Parameters {/*grid-moverow-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `options`: `GridMoveOptions` type, the configuration for moving Grid rows.

### insertCol {/*grid-insertcol*/}

Insert a column at the specified location in the Grid node.

```ts
insertCol: <C extends GridCell>(editor: Editor, at: GridLocation, index: number, cell: Partial<Omit<C, 'children'>>, width?: number, minWidth: number = 5): void
```

#### Parameters {/*grid-insertcol-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: `GridLocation` type, the location to insert at.
- `index`: `number` type, the index of the column to insert.
- `cell`: `Partial<Omit<C, 'children'>>` type, the properties of the column to insert.
- `width`: `number` type, optional parameter, the width of the column to insert, default is `undefined`.
- `minWidth`: `number` type, optional parameter, the minimum width of the column to insert, default is `5`.

### insertRow {/*grid-insertrow*/}

Insert a row at the specified location in the Grid node.

```ts
insertRow: <R extends GridRow, C extends GridCell>(editor: Editor, at: GridLocation, index: number, row: Partial<Omit<R, 'children'>>, cell: Partial<Omit<C, 'children'>>, height?: number): void
```

#### Parameters {/*grid-insertrow-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: `GridLocation` type, the location to insert at.
- `index`: `number` type, the index of the row to insert.
- `row`: `Partial<Omit<R, 'children'>>` type, the properties of the row to insert.
- `cell`: `Partial<Omit<C, 'children'>>` type, the properties of the cells in the row to insert.
- `height`: `number` type, optional parameter, the height of the row to insert, default is `undefined`.

### canMerge {/*grid-canmerge*/}

Determine whether the specified location of the Grid node can be merged.

```ts
canMerge: (editor: Editor, at?: GridLocation): boolean
```

#### Parameters {/*grid-canmerge-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: `GridLocation` type, optional parameter, the location to check, default is the current cursor location.

#### Returns {/*grid-canmerge-returns*/}

- `boolean` type, returns whether the specified location can be merged.

### mergeCell {/*grid-mergecell*/}

Merge the specified cell of the Grid node.

```ts
mergeCell: (editor: Editor, at?: GridLocation, selection?: GridSelection): void
```

#### Parameters {/*grid-mergecell-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: `GridLocation` type, optional parameter, the location to merge, default is the current cursor location.
- `selection`: `GridSelection` type, optional parameter, the selection of the current Gird.

### canSplit {/*grid-cansplit*/}

Check if a specific position in a Grid node can be split.

```ts
canSplit: (editor: Editor, at?: GridLocation): boolean
```

#### Parameters {/*grid-cansplit-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: Optional `GridLocation` parameter to specify the position to check. Defaults to the current cursor position.

#### Returns {/*grid-cansplit-returns*/}

- `boolean` indicating whether the specified position can be split.

### splitCell {/*grid-splitcell*/}

Split the cell at a specific position in a Grid node.

```ts
splitCell: (editor: Editor, at?: GridLocation, selection?: GridSelection): void
```

#### Parameters {/*grid-splitcell-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: Optional `GridLocation` parameter to specify the position to split at. Defaults to the current cursor position.

### cells {/*grid-cells*/}

Get all the cells in a Grid node.

```ts
cells: (editor: Editor, at?: GridLocation, opitons: GridGeneratorCellsOptions = {}): Generator<[GridCell, number, number]>
```

#### Parameters {/*grid-cells-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: Optional `GridLocation` parameter to specify the position to get cells from. Defaults to the current cursor position.
- `options`: Optional `GridGeneratorCellsOptions` parameter to specify options for getting cells. Defaults to `{}`.

#### Returns {/*grid-cells-returns*/}

- `Generator<[GridCell, number, number]>` that yields all the cells in a Grid node.

### span {/*grid-span*/}

If the start or end of the selection is within a merged cell, adjust the selection to include the full merged cell.

```ts
span: (editor: Editor, at: GridLocation, selection: GridSelection): { start: CellPoint; end: CellPoint }
```

#### Parameters {/*grid-span-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: `GridLocation` parameter specifying the location to adjust the selection at.
- `selection`: `GridSelection` parameter specifying the current selection of the Grid.

#### Returns {/*grid-span-returns*/}

- `{ start: CellPoint; end: CellPoint }` object indicating the new start and end points of the selection.

### edges {/*grid-edges*/}

Get all the edges of a Grid node.

```ts
edges: (editor: Editor, at: GridLocation, selection?: GridSelection): GridSelection
```

#### Parameters {/*grid-edges-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: `GridLocation` parameter specifying the location to get edges from.
- `selection`: Optional `GridSelection` parameter specifying the current selection of the Grid. Defaults to `undefined`.

#### Returns {/*grid-edges-returns*/}

- `GridSelection` object containing all the edges of the Grid node.

### focus {/*grid-focus*/}

Focus on a specific cell in a Grid node.

```ts
focus: (editor: Editor, options: {point: CellPoint, at?: GridLocation, edge?: SelectionEdge}): void
```

#### Parameters {/*grid-focus-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `options`: `{point: CellPoint, at?: GridLocation, edge?: SelectionEdge}` object specifying the configuration for focusing on a cell in a Grid node.

### select {/*grid-select*/}

Select a specific cell in a Grid node.

```ts
select: (editor: Editor, at: GridLocation, selection: Partial<GridSelection> = {}) => void
```

#### Parameters {/*grid-select-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: `GridLocation` parameter specifying the location of the cell to select.
- `selection`: Optional `Partial<GridSelection>` parameter specifying the current selection of the Grid. Defaults to `{}`.

### getCell {/*grid-getcell*/}

Get the cell at a specific position in a Grid node.

```ts
getCell: (editor: Editor, at: GridLocation, point: CellPoint): NodeEntry<GridCell> | undefined
```

#### Parameters {/*grid-getcell-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: Type `GridLocation`. The position of the Grid node.
- `point`: Type `CellPoint`. The position of the cell to retrieve.

#### Returns {/*grid-getcell-returns*/}

- Type `NodeEntry<GridCell> | undefined`. The cell at the specified position in the Grid node.

### getRowCount {/*grid-getrowcount*/}

Get the number of rows in a Grid node.

```ts
getRowCount: (editor: Editor, at: GridLocation): number
```

#### Parameters {/*grid-getrowcount-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: Type `GridLocation`. The position of the Grid node.

#### Returns {/*grid-getrowcount-returns*/}

- Type `number`. The number of rows in the Grid node.

### getColCount {/*grid-getcolcount*/}

Get the number of columns in a Grid node.

```ts
getColCount: (editor: Editor, at: GridLocation): number
```

#### Parameters {/*grid-getcolcount-parameters*/}

- `editor`: Type `Editor`, the editor object.
- `at`: Type `GridLocation`. The position of the Grid node.

#### Returns {/*grid-getcolcount-returns*/}

- Type `number`. The number of columns in the Grid node.
