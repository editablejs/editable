---
id: Models
title: List Models
permalink: index.html
---

## List {/*list*/}

定义了列表的基本属性和方法

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

在当前位置向上查找符合条件的列表节点

```ts
above: (editor: Editor, options: ListAboveOptions = {}) => NodeEntry<List> | undefined
```
#### 参数 {/*list-above-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `options`：`ListAboveOptions`类型，可选参数，包括：
  - `at`：`Location`类型，要查找的位置，默认为当前光标所在位置。
  - `match`：`(node: List) => boolean`类型，可选参数，回调函数，用于指定自定义的查找条件。参数`node`表示列表节点，返回值为布尔值。

#### 返回值 {/*list-above-return*/}
- `NodeEntry<List>`类型或`undefined`，返回找到的列表节点或者`undefined`。

### lists {/*list-lists*/}

获取所有符合条件的列表节点

```ts
lists: (editor: Editor, options: ListAboveOptions = {}) => NodeEntry<List>[]
```

#### 参数 {/*list-lists-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `options`：`ListAboveOptions`类型，可选参数，包括：
  - `at`：`Location`类型，要查找的位置，默认为当前光标所在位置。
  - `match`：`(node: List) => boolean`类型，可选参数，回调函数，用于指定自定义的查找条件。参数`node`表示列表节点，返回值为布尔值。

#### 返回值 {/*list-lists-return*/}
- `NodeEntry<List>[]`类型，返回所有找到的列表节点。

### findFirstList {/*list-findfirstlist*/}

查找符合条件的最顶部列表

```ts
findFirstList: (
  editor: Editor,
  options: FindFirstListOptions & { match?: (node: List, path: Path) => boolean },
) => NodeEntry<List> | undefined
```

#### 参数 {/*list-findfirstlist-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `options`：`FindFirstListOptions`类型，包括：
  - `path`：`Path`类型，查找的起始路径。
  - `key`：`string`类型，要查找的列表节点的key属性。
  - `level`：`number`类型，可选参数，表示查找时列表的最小级别。
  - `type`：`string`类型，可选参数，要查找的列表节点的type属性。
  - `match`：`(node: List, path: Path) => boolean`类型，可选参数，回调函数，用于指定自定义的查找条件。参数`node`表示列表节点，参数`path`表示节点所在的路径，返回值为布尔值。

#### 返回值 {/*list-findfirstlist-return*/}
- `NodeEntry<List>`类型或`undefined`，返回找到的

### isFirstList {/*list-isfirstlist*/}

判断当前列表是否为最顶部的列表

```ts
isFirstList: (editor: Editor, options: FindFirstListOptions) => boolean
```

#### 参数 {/*list-isfirstlist-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `options`：`FindFirstListOptions`类型，包括：
  - `path`：`Path`类型，查找的起始路径。
  - `key`：`string`类型，要查找的列表节点的key属性。
  - `level`：`number`类型，可选参数，表示查找时列表的最小级别。
  - `type`：`string`类型，可选参数，要查找的列表节点的type属性。

#### 返回值 {/*list-isfirstlist-return*/}
- `boolean`类型，返回是否为最顶部的列表。

### updateStart {/*list-update-start*/}

更新列表的起始序号

```ts
updateStart: (editor: Editor, options: UpdateStartOptions) => void
```

#### 参数 {/*list-update-start-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `options`：`UpdateStartOptions`类型，包括：
  - `path`：`Path`类型，查找的起始路径。
  - `key`：`string`类型，要查找的列表节点的key属性。
  - `level`：`number`类型，可选参数，表示查找时列表的最小级别。
  - `type`：`string`类型，可选参数，要查找的列表节点的type属性。
  - `mode`：`'all' | 'after'`类型，可选参数，表示更新的范围，`all`表示更新所有列表，`after`表示更新当前列表之后的所有列表。
  - `start`：`number`类型，可选参数，表示更新后的起始序号。

### wrapList {/*list-wrap-list*/}

将当前选区包裹在列表中

```ts
wrapList: <T extends List>(editor: Editor, list: Partial<Omit<T, 'children'>> & { type: string }, opitons:WrapListOptions = {}) => void
```

#### 参数 {/*list-wrap-list-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `list`：`Partial<Omit<T, 'children'>> & { type: string }`类型，要包裹的列表节点。
- `options`：`WrapListOptions`类型，可选参数，包括：
  - `at`：`Location`类型，要查找的位置，默认为当前光标所在位置。
  - `match`：`(node: List) => boolean`类型，可选参数，回调函数，用于指定自定义的查找条件。参数`node`表示列表节点，返回值为布尔值。
  - `props`：`(key: string, node: Element, path: Path) => Record<string, any>`类型，可选参数，回调函数，用于指定自定义的属性。参数`key`表示节点的key属性，参数`node`表示节点，参数`path`表示节点所在的路径，返回值为对象。

### unwrapList {/*list-unwrap-list*/}

将当前选区从列表中移除

```ts
unwrapList: (editor: Editor, options: UnwrapListOptions = {}) => void
```

#### 参数 {/*list-unwrap-list-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `options`：`UnwrapListOptions`类型，可选参数，包括：
  - `at`：`Location`类型，要查找的位置，默认为当前光标所在位置。
  - `match`：`(node: List) => boolean`类型，可选参数，回调函数，用于指定自定义的查找条件。参数`node`表示列表节点，返回值为布尔值。
  - `props`：`(node: List, path: Path) => Record<string, any>`类型，可选参数，回调函数，用于指定自定义的属性。参数`node`表示列表节点，参数`path`表示节点所在的路径，返回值为对象。

### splitList {/*list-split-list*/}

将当前选区从列表中分离出来

```ts
splitList: (editor: Editor, options: SplitListOptions = {}) => void
```

#### 参数 {/*list-split-list-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `options`：`SplitListOptions`类型，可选参数，包括：
  - `at`：`Location`类型，要查找的位置，默认为当前光标所在位置。
  - `match`：`(node: List) => boolean`类型，可选参数，回调函数，用于指定自定义的查找条件。参数`node`表示列表节点，返回值为布尔值。
  - `props`：`(node: List, path: Path) => Record<string, any>`类型，可选参数，回调函数，用于指定自定义的属性。参数`node`表示列表节点，参数`path`表示节点所在的路径，返回值为对象。

### deleteLevel {/*list-delete-level*/}

删除当前选区所在的列表层级

```ts
deleteLevel: (editor: Editor, options: DeleteLevelOptions = {}) => void
```

#### 参数 {/*list-delete-level-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `options`：`DeleteLevelOptions`类型，可选参数，包括：
  - `at`：`Location`类型，要查找的位置，默认为当前光标所在位置。
  - `match`：`(node: List) => boolean`类型，可选参数，回调函数，用于指定自定义的查找条件。参数`node`表示列表节点，返回值为布尔值。
  - `unwrapProps`：`(node: Node, path: Path) => Record<string, any>`类型，可选参数，回调函数，用于指定自定义的属性。参数`node`表示节点，参数`path`表示节点所在的路径，返回值为对象。

### getLevel {/*list-get-level*/}

获取当前选区所在的列表层级

```ts
getLevel: (editor: Editor, options: GetLevelOptions = {}) => number
```

#### 参数 {/*list-get-level-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `options`：`GetLevelOptions`类型，可选参数，包括：
  - `type`：`string`类型，要查找的列表节点的type属性。
  - `key`：`string`类型，要查找的列表节点的key属性。
  - `node`：`Element`类型，要查找的列表节点。
  - `path`：`Path`类型，要查找的列表节点所在的路径。

#### 返回值 {/*list-get-level-return*/}
- `number`类型，返回当前选区所在的列表层级。

### setIndent {/*list-set-indent*/}

设置当前选区所在的列表缩进

```ts
setIndent: (editor: Editor, list: List) => List
```

#### 参数 {/*list-set-indent-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `list`：`List`类型，要设置缩进的列表节点。

#### 返回值 {/*list-set-indent-return*/}
- `List`类型，返回设置缩进后的列表节点。

### addTemplate {/*list-add-template*/}

添加模板

```ts
addTemplate: (editor: Editor, type: string, template: ListTemplate)=> void
```

#### 参数 {/*list-add-template-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `type`：`string`类型，要添加模板的列表节点的type属性。
- `template`：`ListTemplate`类型，要添加的模板。
  - `key`：`string`类型，模板的key属性。
  - `depth`：`number`类型，模板的缩进层级。
  - `render`：`(element: Omit<List, 'children'>) => string | Record<'type' | 'text', string>`类型，回调函数，用于指定自定义的渲染方式。参数`element`表示列表节点，返回值为字符串或对象。

### getTemplate {/*list-get-template*/}

获取模板

```ts
getTemplate: (editor: Editor, type: string, key: string) => ListTemplate
```

#### 参数 {/*list-get-template-params*/}
- `editor`：`Editor`类型，编辑器对象。
- `type`：`string`类型，要获取模板的列表节点的type属性。
- `key`：`string`类型，要获取的模板的key属性。

#### 返回值 {/*list-get-template-return*/}
- `ListTemplate`类型，返回指定的模板。
