---
title: Configuring the Toolbar
---

<Intro>

This page will show you how to configure and use the toolbar in Editable.

</Intro>

## Step 1: Install `@editablejs/plugin-toolbar` {/*step-1*/}

<TerminalBlock>

npm install @editablejs/models @editablejs/editor @editablejs/plugins @editablejs/plugin-toolbar

</TerminalBlock>


## Step 2: Import the Toolbar {/*step-2*/}

```js

import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withPlugins } from '@editablejs/plugins'
import { ToolbarComponent, useToolbarEffect, withToolbar, Toolbar } from '@editablejs/plugin-toolbar'

```

## Step 3: Use `withToolbar` {/*step-3*/}

工具栏是一个插件，所以我们需要使用 `withToolbar` 将其添加到编辑器中。

```js
const App = () => {
  const editor = React.useMemo(() => {
    let editor = withEditable(createEditor())
    editor = withPlugins(editor)
    return withToolbar(editor)
  }, [])

  return (
    <EditableProvider editor={editor}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

## 步骤 4: 使用 `ToolbarComponent` {/*step-4*/}

`ToolbarComponent` 是一个 React 组件，它将会渲染工具栏。

```js
const App = () => {
  const editor = React.useMemo(() => {
    let editor = withEditable(createEditor())
    editor = withPlugins(editor)
    return withToolbar(editor)
  }, [])

  return (
    <EditableProvider editor={editor}>
      <ToolbarComponent />
      <ContentEditable />
    </EditableProvider>
  )
}

```

## 步骤 5: 使用 `useToolbarEffect` {/*step-5*/}

`useToolbarEffect` 是一个 React Hook，在需要更新的时候会执行回调。

在回调的时候，我们可以通过 `Toolbar.setItems` 来更新工具栏的内容。

```js

const marks: [] = ['bold', 'italic', 'underline', 'strikethrough', 'code', 'sub', 'sup']

const App = () => {
  const editor = React.useMemo(() => {
    let editor = withEditable(createEditor())
    editor = withPlugins(editor)
    return withToolbar(editor)
  }, [])

  useToolbarEffect(() => {
    Toolbar.setItems(editor, marks.map(mark => ({
      type: 'button',
      children: mark,
      active: MarkEditor.isActive(editor, mark),
      onToggle: () => {
        MarkEditor.toggle(editor, mark)
      }
    })))
  }, editor)

  return (
    <EditableProvider editor={editor}>
      <ToolbarComponent />
      <ContentEditable />
    </EditableProvider>
  )
}

```

`MarkEditor` 对象是 `@editablejs/plugin-mark` 提供的，它可以帮助我们操作文本的样式。

因为它也属于常用的插件，已经集合在 `@editablejs/plugins` 包中，所以你也可以从 `@editablejs/plugins` 中导入。

```js
import { withPlugins, MarkEditor } from '@editablejs/plugins'
```

## 尝试使用工具栏 {/*try-toolbar*/}

下面的沙盒已经使用了 `@editablejs/plugin-toolbar`，您可以在其中尝试使用工具栏。

<Sandpack deps={['@editablejs/plugins', '@editablejs/plugin-toolbar']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withPlugins, MarkEditor } from '@editablejs/plugins'
import { ToolbarComponent, useToolbarEffect, withToolbar, Toolbar } from '@editablejs/plugin-toolbar'

const marks: [] = ['bold', 'italic', 'underline', 'strikethrough', 'code', 'sub', 'sup']

export default function App() {
  const editor = React.useMemo(() => {
    let editor = withEditable(createEditor())
    editor = withPlugins(editor)
    return withToolbar(editor)
  }, [])

  useToolbarEffect(() => {
    Toolbar.setItems(editor, marks.map(mark => ({
      type: 'button',
      children: mark,
      active: MarkEditor.isActive(editor, mark),
      onToggle: () => {
        MarkEditor.toggle(editor, mark)
      }
    })))
  }, editor)

  return (
    <EditableProvider editor={editor}>
      <ToolbarComponent editor={editor} />
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

除了传统的工具栏外，我们还提供了一些其他的工具栏:

- `inline` - 行内工具栏 `@editablejs/plugin-toolbar/inline`
- `side` - 侧边工具栏 `@editablejs/plugin-toolbar/side`
- `slash` - 快捷键工具栏 `@editablejs/plugin-toolbar/slash`

## 下一步 {/*next-steps*/}

前往 [上下文菜单](/learn/context-menu) 指南了解如何配置使用上下文菜单。
