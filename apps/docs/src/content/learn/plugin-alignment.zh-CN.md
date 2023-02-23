---
title: Alignment
---

<Intro>

这个页面将向您展示如何使用 `Alignment` 插件。

</Intro>

## 安装 Alignment {/*alignment-install*/}

<TerminalBlock>

npm install @editablejs/plugin-alignment

</TerminalBlock>

## 使用 Alignment {/*alignment-using*/}

<Sandpack deps={['@editablejs/plugin-alignment']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withAlign } from '@editablejs/plugin-alignment'

const defaultValue = [
  {
    textAlign: 'left',
    children: [{ text: '左对齐' }]
  },
  {
    textAlign: 'center',
    children: [{ text: '居中对齐' }]
  },
  {
    textAlign: 'right',
    children: [{ text: '右对齐' }]
  },
  {
    textAlign: 'justify',
    children: [{ text: '两端对齐' }]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withAlign(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## 可选项 {/*alignment-options*/}

`withAlign` 接受一个可选的参数，用于配置 `Alignment` 插件。

```js
withAlign(editor, options)
```

### hotkey {/*alignment-options-hotkey*/}

`hotkey` 用于配置 `Alignment` 插件的某个居中模式的快捷键。

- 类型：`AlignmentHotkey`
- 默认值:
  ```ts
  const defaultHotkeys: AlignHotkey = {
    left: 'mod+shift+l',
    center: 'mod+shift+c',
    right: 'mod+shift+r',
    justify: 'mod+shift+j',
  }
  ```
- 示例：

```ts
withAlignment(editor, {
  hotkey: {
    'left': 'mod+shift+l',
  }
})
```
