---
title: Mark
---

<Intro>

This page will show you how to use the Mark plugin.

This package includes basic mark styles such as `bold`, `italic`, `underline`, `strikethrough`, `code`, `sub`, and `sup`.

</Intro>

## Installation {/*mark-install*/}

<TerminalBlock>

npm install @editablejs/plugin-mark

</TerminalBlock>

## Usage {/*mark-using*/}

<Sandpack deps={['@editablejs/plugin-mark']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withMark } from '@editablejs/plugin-mark'

const defaultValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'You can write in ',
      },
      {
        bold: true,
        text: 'bold',
      },
      {
        text: ', write in ',
      },
      {
        italic: true,
        text: 'italics',
      },
      {
        text: ', write in ',
      },
      {
        underline: true,
        text: 'underline',
      },
      {
        text: ', write in ',
      },
      {
        code: true,
        text: 'code',
      },
      {
        text: ', write in ',
      },
      {
        sup: true,
        text: 'superscript',
      },
      {
        text: ', write in ',
      },
      {
        sub: true,
        text: 'subscript',
      },
      {
        text: ', and ',
      },
      {
        text: 'strikethrough',
        strikethrough: true,
      },
    ],
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withMark(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## Options {/*mark-options*/}

`withMark` accepts an optional parameter to configure the `Mark` plugin.

```js
withMark(editor, options)
```

### enabled/disabled {/*mark-options-enabled-disabled*/}

`enabled` is used to configure whether the `Mark` plugin is enabled.

- Type: `MarkFormat[]`
- Default: `all enabled`

- Example:

```ts
withMark(editor, {
  enabled: ['bold', 'italic', 'underline', 'strikethrough', 'code', 'sub', 'sup']
})
```

`disabled` is used to configure whether the `Mark` plugin is disabled.

- Type: `MarkFormat[]`
- Default: `None`

- Example:

```ts
withMark(editor, {
  disabled: ['bold', 'italic', 'underline', 'strikethrough', 'code', 'sub', 'sup']
})
```

### hotkey {/*mark-options-hotkey*/}

`hotkey` is used to configure the keyboard shortcuts for the `Mark` plugin.

- Type: `MarkHotkey`
- Default:
  ```ts
  {
    bold: 'mod+b',
    italic: 'mod+i',
    underline: 'mod+u',
    strikethrough: 'mod+shift+x',
    code: 'mod+e',
    sub: 'mod+,',
    sup: 'mod+.',
  }
  ```

- Example:

```ts
withMark(editor, {
  hotkey: {
    bold: 'mod+b',
    italic: 'mod+i',
    underline: 'mod+u',
    strikethrough: 'mod+shift+x',
    code: 'mod+e',
    sub: 'mod+,',
    sup: 'mod+.',
  }
})
```

### shortcuts {/*table-options-shortcuts*/}

`shortcuts` is used to configure shortcuts for the `Mark` plugin.

- Type: `Record<string, MarkFormat>`
- Default:
  ```ts
  {
    '**': 'bold',
    '*': 'italic',
    '~~': 'strikethrough',
    '`': 'code',
    '^': 'sup',
    '~': 'sub',
  }
  ```

- Example:

```ts
withMark(editor, {
  shortcuts: {
    '**': 'bold',
    '*': 'italic',
    '~~': 'strikethrough',
    '`': 'code',
    '^': 'sup',
    '~': 'sub',
  }
})
```
