---
title: History
---

<Intro>

This page will show you how to use the `History` plugin.

</Intro>

## Installation {/*history-install*/}

<TerminalBlock>

npm install @editablejs/plugin-history

</TerminalBlock>

## Usage {/*history-using*/}

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

## Options {/*history-options*/}

`withHistory` accepts an optional parameter to configure the `History` plugin.

```js
withHistory(editor, options)
```

### hotkey {/*history-options-hotkey*/}

`hotkey` is used to configure the shortcut keys for the `History` plugin.

- Type: `HistoryHotkey`
- Default:
  ```js
  {
    undo: 'mod+z',
    redo: ['mod+y', 'mod+shift+z'],
  }
  ```

- Example:

```ts
withHistory(editor, {
  hotkey: {
    undo: 'mod+z',
    redo: ['mod+y', 'mod+shift+z'],
  }
})
```

### delay {/*history-options-delay*/}

`delay` is used to configure the time interval for storing snapshots in the `History` plugin.

If `delay` is not set, the `History` plugin will attempt to merge with the previous snapshot after each edit.

- Type: `number`
- Default:`undefined`

- Example:

```ts
withHistory(editor, {
  delay: 1000
})
```
