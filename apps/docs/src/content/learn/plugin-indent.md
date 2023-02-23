---
title: Indent
---

<Intro>

This page will show you how to use the `Indent` plugin.

</Intro>

## Installation {/*indent-install*/}

<TerminalBlock>

npm install @editablejs/plugin-indent

</TerminalBlock>

## Usage {/*indent-using*/}

<Sandpack deps={['@editablejs/plugin-indent']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withIndent } from '@editablejs/plugin-indent'

const defaultValue = [
  {
    lineIndent: 1,
    children: [{ text: 'Indentation value of 1.' }]
  },
  {
    children: [{ text: 'Paragraph' }]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withIndent(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## Options {/*indent-options*/}

`withIndent` accepts an optional parameter to configure the `Indent` plugin.

```js
withIndent(editor, options)
```

### hotkey {/*indent-options-hotkey*/}

`hotkey` is used to configure the shortcut keys for the `Indent` plugin.

- Type: `IndentHotkey`
- Default:
  ```ts
  const defaultHotkeys: IndentHotkey = {
    "indent": 'tab',
    "outdent": 'shift+tab',
  }
  ```
- Example:

```ts
withIndent(editor, {
  hotkey: {
    "indent": 'tab',
    "outdent": 'shift+tab',
  }
})
```

### size {/*indent-options-size*/}

`size` is used to configure the size of each unit of indentation in the `Indent` plugin.

- Type: `number`
- Default: `32`

- Example:

```ts
withIndent(editor, {
  size: 32
})
```

### onRenderSize {/*indent-options-onrendersize*/}

`onRenderSize` will be called when the `Indent` plugin renders the indentation value to the DOM node each time.

- Type: `(size: number) => (type: IndentType, size: number) => string | number`
- Default: `undefined`

- Example:

```ts
withIndent(editor, {
  onRenderSize: (size) => (type, size) => {
    if (type === 'indent') {
      return size * 2
    }
    return size
  }
})
```
