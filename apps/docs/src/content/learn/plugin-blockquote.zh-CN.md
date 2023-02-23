---
title: Blockquote
---

<Intro>

这个页面将向您展示如何使用 `Blockquote` 插件。

</Intro>

## 安装 Blockquote {/*blockquote-install*/}

<TerminalBlock>

npm install @editablejs/plugin-blockquote

</TerminalBlock>

## 使用 Blockquote {/*blockquote-using*/}

<Sandpack deps={['@editablejs/plugin-blockquote']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withBlockquote } from '@editablejs/plugin-blockquote'

const defaultValue = [
  {
    type: 'blockquote',
    children: [{
      type: 'paragraph',
      children: [{ text: '这是一个引用' }]
    }]
  }
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withBlockquote(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## 可选项 {/*blockquote-options*/}

`withBlockquote` 接受一个可选的参数，用于配置 `Blockquote` 插件。

```js
withBlockquote(editor, options)
```

### hotkey {/*blockquote-options-hotkey*/}

`hotkey` 用于配置 `Blockquote` 插件的某个居中模式的快捷键。

- 类型：`BlockquoteHotkey`
- 默认值:
  ```ts
  const defaultHotkey: BlockquoteHotkey = 'mod+shift+u'
  ```
- 示例：

```ts
withBlockquote(editor, {
  hotkey: 'mod+shift+u'
})
```
### shortcuts {/*heading-options-shortcuts*/}

`shortcuts` 用于配置 `Blockquote` 插件快捷方式。

- 类型：`string[]`
- 默认值：
  ```ts
  const defaultShortcuts: string[] = ['>']
  ```
- 示例：

```ts
withBlockquote(editor, {
  shortcuts: ['>']
})
```
