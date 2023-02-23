---
title: Title
---

<Intro>

This page will show you how to use the `Title` plugin.

</Intro>

## Installation {/*title-install*/}

<TerminalBlock>

npm install @editablejs/plugin-title

</TerminalBlock>

## Usage {/*title-using*/}

<Sandpack deps={['@editablejs/plugin-title']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withTitle } from '@editablejs/plugin-title'

const defaultValue = [
  {
    type: 'title',
    children: [{ text: '' }]
  },
  {
    children: [{ text: 'This is body' }]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withTitle(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## Options {/*title-options*/}

`withTitle` accepts an optional parameter to configure the `Title` plugin.

```js
withTitle(editor, options)
```

### placeholder {/*title-placeholder*/}

`placeholder` is used to set the placeholder for the title.

- Type: `React.ReactNode`
- Default: `Untitled`

- Example:

```js
withTitle(editor, {
  placeholder: 'Title'
})
```

### component {/*title-component*/}

`component` is used to customize the component for rendering the title.

- Type: `React.FC<TitleComponentProps>`
- Default: `None`

- Example:

```js
withTitle(editor, {
  component: ({ attributes, children }) => {
    return (
      <h1 {...attributes}>
        {children}
      </h1>
    )
  }
})
```
