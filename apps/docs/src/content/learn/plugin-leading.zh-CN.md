---
title: Leading
---

<Intro>

这个页面将向您展示如何使用 `Leading` 插件。

</Intro>

## 安装 Leading {/*leading-install*/}

<TerminalBlock>

npm install @editablejs/plugin-leading

</TerminalBlock>

## 使用 Leading {/*leading-using*/}

<Sandpack deps={['@editablejs/plugin-leading']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withLeading } from '@editablejs/plugin-leading'

const defaultValue = [
  {
    lineHeight: 1,
    children: [{ text: 'Line Height 1' }]
  },
  {
    lineHeight: 2,
    children: [{ text: 'Line Height 2' }]
  },
  {
    lineHeight: 3,
    children: [{ text: 'Line Height 3' }]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withLeading(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## 可选项 {/*leading-options*/}

`withLeading` 接受一个可选的参数，用于配置 `Leading` 插件。

```js
withLeading(editor, options)
```

### hotkey {/*leading-options-hotkey*/}

`hotkey` 用于配置 `Leading` 插件的快捷键。

- 类型：`LeadingHotkey`
- 默认值: `{}`

- 示例：

```ts
withLeading(editor, {
  hotkey: {
    '1': 'mod+shift+1',
  }
})
```
