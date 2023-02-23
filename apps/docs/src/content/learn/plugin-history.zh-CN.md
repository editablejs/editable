---
title: History
---

<Intro>

这个页面将向您展示如何使用 `History` 插件。

</Intro>

## 安装 History {/*history-install*/}

<TerminalBlock>

npm install @editablejs/plugin-history

</TerminalBlock>

## 使用 History {/*history-using*/}

<Sandpack deps={['@editablejs/plugin-history']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withHistory } from '@editablejs/plugin-history'

const defaultValue = [
  {
    children: [{ text: 'Test history plugin' }]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withHistory(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## 可选项 {/*history-options*/}

`withHistory` 接受一个可选的参数，用于配置 `History` 插件。

```js
withHistory(editor, options)
```

### hotkey {/*history-options-hotkey*/}

`hotkey` 用于配置 `History` 插件的快捷键。

- 类型：`HistoryHotkey`
- 默认值:
  ```js
  {
    undo: 'mod+z',
    redo: ['mod+y', 'mod+shift+z'],
  }
  ```

- 示例：

```ts
withHistory(editor, {
  hotkey: {
    undo: 'mod+z',
    redo: ['mod+y', 'mod+shift+z'],
  }
})
```

### delay {/*history-options-delay*/}

`delay` 用于配置 `History` 插件存入同一个快照的时间间隔。

如果未设置 `delay`，则 `History` 插件将在每次编辑后尝试与上一个快照合并。

- 类型：`number`
- 默认值：`undefined`

- 示例：

```ts
withHistory(editor, {
  delay: 1000
})
```
