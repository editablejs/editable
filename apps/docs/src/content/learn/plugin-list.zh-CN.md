---
title: List
---

<Intro>

这个页面将向您展示如何使用 `List` 插件。

这个包包含了 `unordered-list`、 `ordered-list` 和 `task-list` 三个插件。

</Intro>

## 安装 List {/*list-install*/}

<TerminalBlock>

npm install @editablejs/plugin-list

</TerminalBlock>

## 使用 List {/*list-using*/}

<Sandpack deps={['@editablejs/plugin-list']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withOrderedList, withUnorderedList, withTaskList } from '@editablejs/plugin-list'

const defaultValue = [
  {
    type: 'ordered-list',
    start: 1,
    children: [{ text: 'Ordered List' }]
  },
  {
    type: 'unordered-list',
    children: [{ text: 'Unordered List' }]
  },
  {
    type: 'task-list',
    children: [{ text: 'Task List' }]
  }
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withTaskList(withUnorderedList(withOrderedList(editor)))
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## 可选项 {/*list-options*/}

`withOrderedList`, `withUnorderedList`, `withTaskList` 都可以接受一个可选的参数，用于配置 `List` 插件。

```js
withOrderedList(editor, options)
withUnorderedList(editor, options)
withTaskList(editor, options)
```

### hotkey {/*leading-options-hotkey*/}

`hotkey` 用于配置 `List` 插件的快捷键。

- 类型：`OrderedListHotkey` | `UnorderedListHotkey` | `TaskListHotkey`
- 默认值: `mod+shift+7` | `mod+shift+8` | `mod+shift+9`

- 示例：

```ts
withOrderedList(editor, {
  hotkey: 'mod+shift+7'
})
withUnorderedList(editor, {
  hotkey: 'mod+shift+8'
})
withTaskList(editor, {
  hotkey: 'mod+shift+9'
})
```

### shortcuts {/*list-options-shortcuts*/}

`shortcuts` 用于配置 `List` 插件快捷方式。

- 类型：`boolean`
- 默认值：`true`

- 示例：

```ts
withOrderedList(editor, {
  shortcuts: true
})
withUnorderedList(editor, {
  shortcuts: true
})
withTaskList(editor, {
  shortcuts: true
})
```
