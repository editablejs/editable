---
title: Hr
---

<Intro>

This page will show you how to use the `Hr` plugin.

</Intro>

## Installation {/*hr-install*/}

<TerminalBlock>

npm install @editablejs/plugin-hr

</TerminalBlock>

## Usage {/*hr-using*/}

<Sandpack deps={['@editablejs/plugin-hr']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withHr } from '@editablejs/plugin-hr'

const defaultValue = [
  {
    children: [{ text: 'Paragraph' }]
  },
  {
    type: 'hr',
    children: [{ text: '' }]
  },
  {
    children: [{ text: '' }]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withHr(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## Options {/*hr-options*/}

`withHr` accepts an optional parameter to configure the `Hr` plugin.

```js
withHr(editor, options)
```

### locale {/*hr-options-locale*/}

`locale` is used to configure internationalization for the `Hr` plugin.

- Type: `Record<string, HrLocale>`
- Default:
  ```ts
  const defaultLocale: Record<string, HrLocale> ={
    locale: 'en-US',
    hr: {
      toolbar: {
        defaultColor: 'Default color',
        color: 'Color',
        style: 'Style',
        width: 'Thickness',
      },
    },
  }
  ```

### hotkey {/*hr-options-hotkey*/}

`hotkey` is used to configure the shortcut keys for the `Hr` plugin.

- Type: `HrHotkey`
- Default: `mod+shift+e`

- Example:

```ts
withHr(editor, {
  hotkey: {
    'hr': 'mod+shift+e',
  }
})
```

### shortcuts {/*table-options-shortcuts*/}

`shortcuts` is used to configure shortcuts for the `Hr` plugin.

- Type: `string[]`
- Default: `['*', '-']`

- Example:

```ts
withHr(editor, {
  shortcuts: ['*', '-']
})
```
