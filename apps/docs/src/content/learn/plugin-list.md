---
title: List
---

<Intro>

This page will show you how to use the `List` plugin.

The package includes three plugins: `unordered-list`, `ordered-list`, and `task-list`.

</Intro>

## Installation {/*list-install*/}

<TerminalBlock>

npm install @editablejs/plugin-list

</TerminalBlock>

## Usage {/*list-using*/}

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

## Options {/*list-options*/}

`withOrderedList`, `withUnorderedList`, `withTaskList` can all accept an optional parameter for configuring the `List` plugin.

```js
withOrderedList(editor, options)
withUnorderedList(editor, options)
withTaskList(editor, options)
```

### hotkey {/*list-options-hotkey*/}

`hotkey` is used to configure the keyboard shortcut of a certain type of heading for the `List` plugin.

- Type: `OrderedListHotkey` | `UnorderedListHotkey` | `TaskListHotkey`
- Default:  `mod+shift+7` | `mod+shift+8` | `mod+shift+9`

- Example:

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

`shortcuts` is used to configure the markdown phrase of a certain type of heading for the `List` plugin.

- Type: `boolean`
- Default: `true`

- Example:

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
