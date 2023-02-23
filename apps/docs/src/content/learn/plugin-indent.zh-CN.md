---
title: Indent
---

<Intro>

这个页面将向您展示如何使用 `Indent` 插件。

</Intro>

## 安装 Indent {/*indent-install*/}

<TerminalBlock>

npm install @editablejs/plugin-indent

</TerminalBlock>

## 使用 Indent {/*indent-using*/}

<Sandpack deps={['@editablejs/plugin-indent']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withIndent } from '@editablejs/plugin-indent'

const defaultValue = [
  {
    lineIndent: 1,
    children: [{ text: 'Indentation value of 1.' }]
  },
  {
    children: [{ text: 'Paragraph' }]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withIndent(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## 可选项 {/*indent-options*/}

`withIndent` 接受一个可选的参数，用于配置 `Indent` 插件。

```js
withIndent(editor, options)
```

### hotkey {/*indent-options-hotkey*/}

`hotkey` 用于配置 `Indent` 插件的快捷键。

- 类型：`IndentHotkey`
- 默认值:
  ```ts
  const defaultHotkeys: IndentHotkey = {
    "indent": 'tab',
    "outdent": 'shift+tab',
  }
  ```
- 示例：

```ts
withIndent(editor, {
  hotkey: {
    "indent": 'tab',
    "outdent": 'shift+tab',
  }
})
```

### size {/*indent-options-size*/}

`size` 用于配置 `Indent` 插件的每单位缩进的大小。

- 类型：`number`
- 默认值：`32`

- 示例：

```ts
withIndent(editor, {
  size: 32
})
```

### onRenderSize {/*indent-options-onrendersize*/}

`onRenderSize` 会在 `Indent` 插件每次渲染缩进值到dom节点上时调用。

- 类型：`(size: number) => (type: IndentType, size: number) => string | number`
- 默认值：`undefined`

- 示例：

```ts
withIndent(editor, {
  onRenderSize: (size) => (type, size) => {
    if (type === 'indent') {
      return size * 2
    }
    return size
  }
})
```
