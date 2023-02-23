---
title: Blockquote
---

<Intro>

This page will show you how to use the `Blockquote` plugin.

</Intro>

## Installation {/*blockquote-install*/}

<TerminalBlock>

npm install @editablejs/plugin-blockquote

</TerminalBlock>

## Usage {/*blockquote-using*/}

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
      children: [{ text: 'This is a quote' }]
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

## Options {/*blockquote-options*/}

`withBlockquote` accepts an optional parameter for configuring the `Blockquote` plugin.

```js
withBlockquote(editor, options)
```

### hotkey {/*blockquote-options-hotkey*/}

`hotkey` is used to configure the shortcut key for a specific centering mode of the `Blockquote` plugin.

- Type: `BlockquoteHotkey`
- Default:
  ```ts
  const defaultHotkey: BlockquoteHotkey = 'mod+shift+u'
  ```
- Example:

```ts
withBlockquote(editor, {
  hotkey: 'mod+shift+u'
})
```
### shortcuts {/*heading-options-shortcuts*/}

`shortcuts` is used to configure shortcuts for the `Blockquote` plugin.

- Type: `string[]`
- Default:
  ```ts
  const defaultShortcuts: string[] = ['>']
  ```
- Example:

```ts
withBlockquote(editor, {
  shortcuts: ['>']
})
```
