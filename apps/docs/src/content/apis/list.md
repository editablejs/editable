---
id: Models
title: List Models
permalink: index.html
---

## List {/*list*/}

Defines the basic properties and methods of a list.

```ts
export interface List extends Element {
  start: number
  key: string
  level: number
  type: string
  template?: string
}
```

### above {/*list-above*/}

Find the list node that matches the specified condition above the current location.

```ts
above: (editor: Editor, options: ListAboveOptions = {}) => NodeEntry<List> | undefined
```
#### Parameters {/*list-above-parameters*/}
- `editor`: An `Editor` object.
- `options`: A `ListAboveOptions` object, which includes:
  - `at`: A `Location` object indicating the position to look for. The default value is the current cursor position.
  - `match`: A callback function of `(node: List) => boolean` type, which is an optional parameter used to specify custom search conditions. The `node` parameter represents the list node, and the return value is a boolean.

#### Return Value {/*list-above-return-value*/}
- A `NodeEntry<List>` object or `undefined`, which represents the found list node or `undefined`.

### lists {/*list-lists*/}

Get all list nodes that match the specified condition.

```ts
lists: (editor: Editor, options: ListAboveOptions = {}) => NodeEntry<List>[]
```

#### Parameters {/*list-lists-parameters*/}
- `editor`: An `Editor` object.
- `options`: A `ListAboveOptions` object, which includes:
  - `at`: A `Location` object indicating the position to look for. The default value is the current cursor position.
  - `match`: A callback function of `(node: List) => boolean` type, which is an optional parameter used to specify custom search conditions. The `node` parameter represents the list node, and the return value is a boolean.

#### Return Value {/*list-lists-return-value*/}
- An array of `NodeEntry<List>` objects, which represents all found list nodes.

### findFirstList {/*list-find-first-list*/}

Find the top-most list node that matches the specified condition.

```ts
findFirstList: (
  editor: Editor,
  options: FindFirstListOptions & { match?: (node: List, path: Path) => boolean },
) => NodeEntry<List> | undefined
```

#### Parameters {/*list-find-first-list-parameters*/}
- `editor`: An `Editor` object.
- `options`:  A `FindFirstListOptions` object, which includes:
  - `path`: A `Path` object indicating the starting path of the search.
  - `key`: A `string` representing the key attribute of the list node to be searched.
  - `level`: A `number` representing the minimum level of the list to be searched. This is an optional parameter.
  - `type`: A `string` representing the type attribute of the list node to be searched. This is an optional parameter.
  - `match`: A callback function of `(node: List, path: Path) => boolean` type, which is an optional parameter used to specify custom search conditions. The `node` parameter represents the list node, the `path` parameter represents the path where the node is located, and the return value is a boolean.

#### Return Value {/*list-find-first-list-return-value*/}
- A `NodeEntry<List>` object or `undefined`, which represents the found top-most list node or `undefined`.

### isFirstList {/*list-is-first-list*/}

Determine whether the current list is the top-most list that matches the specified condition.

```ts
isFirstList: (editor: Editor, options: FindFirstListOptions) => boolean
```

#### Parameters {/*list-is-first-list-parameters*/}
- `editor`: An `Editor` object.
- `options`: A `FindFirstListOptions` object, which includes:
  - `path`: A `Path` object indicating the starting path of the search.
  - `key`: A `string` representing the key property of the list node to search for.
  - `level`: An optional `number` representing the minimum level of the list when searching.
  - `type`: An optional `string` representing the type attribute of the list node to be searched.

#### Return Value {/*list-is-first-list-return-value*/}
- A `boolean` indicating whether it is the top-level list.

### updateStart {/*list-update-start*/}

Update the starting index of the list.

```ts
updateStart: (editor: Editor, options: UpdateStartOptions) => void
```

#### Parameters {/*list-update-start-parameters*/}
- `editor`: An `Editor` object.
- `options`: `UpdateStartOptions`类型，包括:
  - `path`: A `Path` object representing the starting path to search.
  - `key`: A `string` representing the key attribute of the list node to be searched.
  - `level`: An optional `number` representing the minimum level of the list when searching.
  - `type`: An optional `string` representing the type attribute of the list node to be searched.
  - `mode`: An optional `'all' | 'after'` type representing the range to update. all means update `all` lists, and `after` means update all lists after the current list.
  - `start`: An optional `number` representing the starting index after the update.

### wrapList {/*list-wrap-list*/}

Wrap the current selection in a list.

```ts
wrapList: <T extends List>(editor: Editor, list: Partial<Omit<T, 'children'>> & { type: string }, opitons:WrapListOptions = {}) => void
```

#### Parameters {/*list-wrap-list-parameters*/}
- `editor`: An `Editor` object.
- `list`: A `Partial<Omit<T, 'children'>> & { type: string }` object representing the list node to be wrapped.
- `options`: An optional `WrapListOptions` object, including:
  - `at`: A `Location` object indicating the position to look for. The default value is the current cursor position.
  - `match`: A callback function of `(node: List) => boolean` type, which is an optional parameter used to specify custom search conditions. The `node` parameter represents the list node, and the return value is a boolean.
  - `props`: A callback function `(key: string, node: Element, path: Path) => Record<string, any>` to specify custom properties. The `key` parameter represents the node's key attribute, the `node` parameter represents the node, the `path` parameter represents the path where the node is located, and the return value is an object.

### unwrapList {/*list-unwrap-list*/}

Remove the current selection from the list.

```ts
unwrapList: (editor: Editor, options: UnwrapListOptions = {}) => void
```

#### Parameters {/*list-unwrap-list-parameters*/}
- `editor`: An `Editor` object.
- `options`: An optional `UnwrapListOptions` object, including:
  - `at`: A `Location` object indicating the position to look for. The default value is the current cursor position.
  - `match`: A callback function of `(node: List) => boolean` type, which is an optional parameter used to specify custom search conditions. The `node` parameter represents the list node, and the return value is a boolean.
  - `props`: Optional. A callback function of type `(node: List, path: Path) => Record<string, any>` which specifies custom properties. The `node` parameter represents the list node, the `path` parameter represents the path of the node, and the return value is an object.

### splitList {/*list-split-list*/}

Split the current selection from a list.

```ts
splitList: (editor: Editor, options: SplitListOptions = {}) => void
```

#### Parameters {/*list-split-list-parameters*/}
- `editor`: An `Editor` object.
- `options`: Optional. An object of type `SplitListOptions` which includes:
  - `at`: A `Location` object indicating the position to look for. The default value is the current cursor position.
  - `match`: A callback function of `(node: List) => boolean` type, which is an optional parameter used to specify custom search conditions. The `node` parameter represents the list node, and the return value is a boolean.
  - `props`: Optional. A callback function of type `(node: List, path: Path) => Record<string, any>` which specifies custom properties. The node parameter represents the list node, the path parameter represents the path of the node, and the return value is an object.

### deleteLevel {/*list-delete-level*/}

Delete the list level of the current selection.

```ts
deleteLevel: (editor: Editor, options: DeleteLevelOptions = {}) => void
```

#### Parameters {/*list-delete-level-parameters*/}
- `editor`: An `Editor` object.
- `options`: Optional. An object of type `DeleteLevelOptions` which includes:
  - `at`: A `Location` object indicating the position to look for. The default value is the current cursor position.
  - `match`: A callback function of `(node: List) => boolean` type, which is an optional parameter used to specify custom search conditions. The `node` parameter represents the list node, and the return value is a boolean.
  - `unwrapProps`: Optional. A callback function of type `(node: Node, path: Path) => Record<string, any>` which specifies custom properties. The `node` parameter represents the node, the `path` parameter represents the path of the node, and the return value is an object.

### getLevel {/*list-get-level*/}

Get the list level of the current selection.

```ts
getLevel: (editor: Editor, options: GetLevelOptions = {}) => number
```

#### Parameters {/*list-get-level-parameters*/}
- `editor`: An `Editor` object.
- `options`: Optional. An object of type `GetLevelOptions` which includes:
  - `type`: A `string` specifying the type attribute of the list node to search for.
  - `key`: A `string` specifying the `key` attribute of the list node to search for.
  - `node`: An `Element` object representing the list node to search for.
  - `path`: A `Path` object representing the path of the list node to search for.

#### Return Value {/*list-get-level-return-value*/}
- A `number` representing the list level of the current selection.

### setIndent {/*list-set-indent*/}

Set the indentation of the current selected list.

```ts
setIndent: (editor: Editor, list: List) => List
```

#### Parameters {/*list-set-indent-parameters*/}
- `editor`: An `Editor` object.
- `list`: A `List` object representing the list node to set indentation.

#### Return Value {/*list-set-indent-return-value*/}
- A `List` object representing the updated list node with indentation.

### addTemplate {/*list-add-template*/}

Add a template.

```ts
addTemplate: (editor: Editor, type: string, template: ListTemplate)=> void
```

#### Parameters {/*list-add-template-parameters*/}
- `editor`: An `Editor` object.
- `type`: A `string` representing the type attribute of the list node to add a template to.
- `template`: A `ListTemplate` object representing the template to add.
  - `key`: A `string` representing the key attribute of the template.
  - `depth`: A `number` representing the indentation level of the template.
  - `render`: A callback function `(element: Omit<List, 'children'>) => string | Record<'type' | 'text', string>` specifying a custom rendering method. The element parameter represents the list node, and the return value can be a string or an object.

### getTemplate {/*list-get-template*/}

Get a template.

```ts
getTemplate: (editor: Editor, type: string, key: string) => ListTemplate
```

#### Parameters {/*list-get-template-parameters*/}
- `editor`: An `Editor` object.
- `type`: A `string` representing the `type` attribute of the list node to get a template for.
- `key`: A `string` representing the key attribute of the template to get.

#### Return Value {/*list-get-template-return-value*/}
- A `ListTemplate` object representing the specified template.
