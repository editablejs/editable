---
title: Alignment
---

<Intro>

This page will show you how to use the `Alignment` plugin.

</Intro>

## Installation {/*alignment-install*/}

<TerminalBlock>

npm install @editablejs/plugin-alignment

</TerminalBlock>

## Usage {/*alignment-using*/}

<Sandpack deps={['@editablejs/plugin-alignment']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withAlign } from '@editablejs/plugin-alignment'

const defaultValue = [
  {
    textAlign: 'left',
    children: [{ text: 'Left aligned' }]
  },
  {
    textAlign: 'center',
    children: [{ text: 'Center aligned' }]
  },
  {
    textAlign: 'right',
    children: [{ text: 'Right aligned' }]
  },
  {
    textAlign: 'justify',
    children: [{ text: 'Justified' }]
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

## Options {/*alignment-options*/}

`withAlign` takes an optional options object to configure the `Alignment` plugin.

```js
withAlign(editor, options)
```

### hotkey {/*alignment-options-hotkey*/}

`hotkey` configures a keyboard shortcut for a specific alignment mode of the `Alignment` plugin.

- Type: `AlignmentHotkey`
- Default:
  ```ts
  const defaultHotkeys: AlignHotkey = {
    left: 'mod+shift+l',
    center: 'mod+shift+c',
    right: 'mod+shift+r',
    justify: 'mod+shift+j',
  }
  ```
- Example:

```ts
withAlign(editor, {
  hotkey: {
    'left': 'mod+shift+l',
  }
})
```
