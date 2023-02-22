---
title: Configuring Context Menu Usage
---

<Intro>

This page will show you how to configure the usage of context menus in Editable.

</Intro>

## Step 1: Install `@editablejs/plugin-context-menu` {/*step-1*/}

If you have already installed `@editablejs/plugins`, you can skip this step.

Since the native `contenteditable` attribute does not provide correct content response in the editing area, we need to use a plugin to achieve the context menu.

<TerminalBlock>

npm install @editablejs/models @editablejs/editor @editablejs/plugin-context-menu

</TerminalBlock>



## Step 2: Import withContextMenu {/*step-2*/}

If you have already installed `@editablejs/plugins`, you can import `withContextMenu` from `@editablejs/plugins`.

```js

import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withContextMenu, useContextMenuEffect, ContextMenu } from '@editablejs/plugin-context-menu'

// import { withContextMenu, useContextMenuEffect, ContextMenu } from '@editablejs/plugins'

```

## Step 3: Use `withContextMenu` {/*step-3*/}

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

## Step 4: Use `useContextMenuEffect` {/*step-4*/}

`useContextMenuEffect` is a React Hook that executes a callback when an update is needed.

In the callback, we can update the contents of the menu through `ContextMenu.setItems`.

```js
useContextMenuEffect(() => {
  ContextMenu.setItems(editor, [{
      key: 'copy',
      title: 'Copy',
      onSelect() {
        editor.copy()
      },
    },
    {
      key: 'paste',
      title: 'Paste',
      onSelect() {
        editor.insertFromClipboard()
      },
    }]
  )
}, editor)
```

## Try the Context Menu {/*try-context-menu*/}

The sandbox below has already used `@editablejs/plugin-context-menu`, you can try using the context menu by right-clicking in the editor.

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
        title: 'Copy',
        onSelect() {
          editor.copy()
        },
      },
      {
        key: 'paste',
        title: 'Paste',
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
