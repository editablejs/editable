---
title: Link
---

<Intro>

This page will show you how to use the `Link` plugin.

</Intro>

## Installation {/*link-install*/}

<TerminalBlock>

npm install @editablejs/plugin-link

</TerminalBlock>

## Usage {/*link-using*/}

<Sandpack deps={['@editablejs/plugin-link']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withLink } from '@editablejs/plugin-link'

const defaultValue = [
  {
    children: [
      { text: 'This is a' },
      {
        type: 'link',
        href: 'https://docs.editablejs.com',
        children: [{ text: 'link plugin' }]
      },
      { text: '.'}
    ]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withLink(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## Options {/*link-options*/}

`withLink` accepts an optional parameter to configure the `Link` plugin.

```js
withLink(editor, options)
```

### locale {/*link-options-locale*/}

`locale` is used to configure internationalization for the `Link` plugin.

- Type: `Record<string, LinkLocale>`
- Default:
  ```ts
  const defaultLocale: Record<string, LinkLocale> ={
    locale: 'en-US',
    link: {
      link: 'Link',
      linkPlaceholder: 'Paste or enter a link',
      text: 'Text',
      textPlaceholder: 'Enter content description',
      ok: 'OK',
      cancelLink: 'Cancel link',
    },
  }
  ```

### hotkey {/*link-options-hotkey*/}

`hotkey` is used to configure the shortcut keys for the `Link` plugin.

- Type: `LinkHotkey`
- Default: `mod+k`

- Example:

```ts
withLink(editor, {
  hotkey: {
    'link': 'mod+k',
  }
})
```

### shortcuts {/*table-options-shortcuts*/}

`shortcuts` is used to configure shortcuts for the `Link` plugin.

- Type: `boolean`
- Default: `true`

- Example:

```ts
withLink(editor, {
  shortcuts: true
})
```
