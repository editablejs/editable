---
title: Mention
---

<Intro>

This page will show you how to use the `Mention` plugin.

</Intro>

## Installation {/*mention-install*/}

<TerminalBlock>

npm install @editablejs/plugin-mention

</TerminalBlock>

## Usage {/*mention-using*/}

<Sandpack deps={['@editablejs/plugin-mention']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withMention } from '@editablejs/plugin-mention'

const defaultValue = [
  {
    children: [
      { text: 'Hi, ' },
      {
        type: 'mention',
        user: {
          id: '1',
          name: 'John Doe',
        },
        children: [{ text: '' }]
      },
      { text: '.'}
    ]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withMention(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## Options {/*mention-options*/}

`withMention` accepts an optional parameter to configure the `Mention` plugin.

```js
withMention(editor, options)
```

### placeholder {/*mention-placeholder*/}

`placeholder` is used to configure the placeholder when searching with the `Mention` plugin.

- Type: `React.ReactNode | ((children: React.ReactElement) => React.ReactElement)`
- Default: `None`

- Example:

```js
withMention(editor, {
  placeholder: 'Search...'
})
```

### triggerChar {/*mention-triggerchar*/}

`triggerChar` is used to configure the trigger character for the `Mention` plugin.

- Type: `string`
- Default: `@`

- Example:

```js
withMention(editor, {
  triggerChar: '#'
})
```

### match {/*mention-match*/}

`match` is used to configure the node validation when triggering the `Mention` plugin.

- Type: `(node: Node, path: Path) => boolean`
- Default: `None`

- Example:

```js
withMention(editor, {
  match: (node, path) => {
    return node.type === 'paragraph' && path.length === 1
  }
})
```

### debounceWait {/*mention-debouncewait*/}

`debounceWait` is used to configure the debounce time when searching with the `Mention` plugin.

- Type: `number`
- Default: `100`

- Example:

```js
withMention(editor, {
  debounceWait: 200
})
```

### debounceMaxWait {/*mention-debouncemaxwait*/}

`debounceMaxWait` is used to configure the maximum debounce wait time when searching with the `Mention` plugin.

- Type: `number`
- Default: `1000`

- Example:

```js
withMention(editor, {
  debounceMaxWait: 2000
})
```

### onSearch {/*mention-onsearch*/}

`onSearch` is used to configure the search callback for the `Mention` plugin.

- Type: `(search: string) => Promise<MentionUser[]>`
- Default: `None`

- Example:

```js
withMention(editor, {
  onSearch: async (search) => {
    const res = await fetch(`https://api.github.com/search/users?q=${search}`)
    const data = await res.json()
    return data.items.map((item) => ({
      id: item.id,
      name: item.login,
    }))
  }
})
```

### onSearchRender {/*mention-onsearchrender*/}

`onSearchRender` is used to configure the search result rendering for the `Mention` plugin.

- Type: `(users: MentionUser[]) => React.ReactElement`
- Default: `None`

- Example:

```js
withMention(editor, {
  onSearchRender: (users) => {
    return (
      <div>
        {users.map((user) => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    )
  }
})
```

### onSearchRenderItem {/*mention-onsearchrenderitem*/}

`onSearchRenderItem` is used to configure the search result item rendering for the `Mention` plugin.

- Type: `(user: MentionUser) => React.ReactNode`
- Default: `None`

- Example:

```js
withMention(editor, {
  onSearchRenderItem: (user) => {
    return (
      <div>
        <img src={user.avatar_url} />
        <span>{user.name}</span>
      </div>
    )
  }
})
```

### onSearchRenderEmpty {/*mention-onsearchrenderempty*/}

`onSearchRenderEmpty` is used to configure the rendering when the search result is empty for the `Mention` plugin.

- Type: `() => React.ReactNode`
- Default: `None`

- Example:

```js
withMention(editor, {
  onSearchRenderEmpty: () => {
    return (
      <div>
        <span>Not Found</span>
      </div>
    )
  }
})
```
