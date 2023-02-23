---
title: Leading
---

<Intro>

This page will show you how to use the `Leading` plugin.

</Intro>

## Installation {/*leading-install*/}

<TerminalBlock>

npm install @editablejs/plugin-leading

</TerminalBlock>

## Usage {/*leading-using*/}

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

## Options {/*leading-options*/}

`withLeading` accepts an optional parameter to configure the `Leading` plugin.

```js
withLeading(editor, options)
```

### hotkey {/*leading-options-hotkey*/}

`hotkey` is used to configure the shortcut keys for the `Leading` plugin.

- Type: `LeadingHotkey`
- Default: `{}`

- Example:

```ts
withLeading(editor, {
  hotkey: {
    '1': 'mod+shift+1',
  }
})
```
