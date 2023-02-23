---
title: Title
---

<Intro>

这个页面将向您展示如何使用 `Title` 插件。

</Intro>

## 安装 Title {/*title-install*/}

<TerminalBlock>

npm install @editablejs/plugin-title

</TerminalBlock>

## 使用 Title {/*title-using*/}

<Sandpack deps={['@editablejs/plugin-title']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withTitle } from '@editablejs/plugin-title'

const defaultValue = [
  {
    type: 'title',
    children: [{ text: '' }]
  },
  {
    children: [{ text: 'This is body' }]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withTitle(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## 可选项 {/*title-options*/}

`withTitle` 接受一个可选的参数，用于配置 `Title` 插件。

```js
withTitle(editor, options)
```

### placeholder {/*title-placeholder*/}

`placeholder` 用于设置标题的占位符。

- 类型：`React.ReactNode`
- 默认值：`Untitled`

- 示例：

```js
withTitle(editor, {
  placeholder: 'Title'
})
```

### component {/*title-component*/}

`component` 用于自定义渲染标题的组件。

- 类型：`React.FC<TitleComponentProps>`
- 默认值：`无`

- 示例：

```js
withTitle(editor, {
  component: ({ attributes, children }) => {
    return (
      <h1 {...attributes}>
        {children}
      </h1>
    )
  }
})
```
