---
title: 配置使用上下文菜单
---

<Intro>

这个页面将向您展示如何在 Editable 中配置使用上下文菜单。

</Intro>

## 步骤 1: 安装 `@editablejs/plugin-context-menu` {/*step-1*/}

如果您已经安装了 `@editablejs/plugins`，则可以跳过此步骤。

因为未使用原生的`contenteditbale` 属性，所以原生上下文菜单在编辑区域得不到正确的内容响应，所以我们需要使用插件来实现上下文菜单。

<TerminalBlock>

npm install @editablejs/models @editablejs/editor @editablejs/plugin-context-menu

</TerminalBlock>



## 步骤 2: 导入 withContextMenu {/*step-2*/}

如果您已经安装了 `@editablejs/plugins`，则可以从 `@editablejs/plugins` 中导入 `withContextMenu`。

```js

import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withContextMenu, useContextMenuEffect, ContextMenu } from '@editablejs/plugin-context-menu'

// import { withContextMenu, useContextMenuEffect, ContextMenu } from '@editablejs/plugins'

```

## 步骤 3: 使用 `withContextMenu` {/*step-3*/}

```js
const App = () => {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withContextMenu(editor)
  }, [])

  return (
    <EditableProvider editor={editor}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

## 步骤 4: 使用 `useContextMenuEffect` {/*step-4*/}

`useContextMenuEffect` 是一个 React Hook，在需要更新的时候会执行回调。

在回调的时候，我们可以通过 `ContextMenu.setItems` 来更新菜单内的内容。

```js
useContextMenuEffect(() => {
  ContextMenu.setItems(editor, [{
      key: 'copy',
      title: '复制',
      onSelect() {
        editor.copy()
      },
    },
    {
      key: 'paste',
      title: '粘贴',
      onSelect() {
        editor.insertFromClipboard()
      },
    }]
  )
}, editor)
```

## 尝试使用上下文菜单 {/*try-context-menu*/}

下面的沙箱已经使用了 `@editablejs/plugin-context-menu`，您可以在编辑器中点击鼠标`右键`尝试使用。

<Sandpack deps={['@editablejs/plugin-context-menu']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withContextMenu, useContextMenuEffect, ContextMenu } from '@editablejs/plugin-context-menu'

export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withContextMenu(editor)
  }, [])

  useContextMenuEffect(() => {
    ContextMenu.setItems(editor, [{
        key: 'copy',
        title: '复制',
        onSelect() {
          editor.copy()
        },
      },
      {
        key: 'paste',
        title: '粘贴',
        onSelect() {
          editor.insertFromClipboard()
        },
      }]
    )
  }, editor)

  return (
    <EditableProvider editor={editor}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>
