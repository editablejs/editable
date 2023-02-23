---
title: Mention
---

<Intro>

这个页面将向您展示如何使用 `Mention` 插件。

</Intro>

## 安装 Mention {/*mention-install*/}

<TerminalBlock>

npm install @editablejs/plugin-mention

</TerminalBlock>

## 使用 Mention {/*mention-using*/}

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

## 可选项 {/*mention-options*/}

`withMention` 接受一个可选的参数，用于配置 `Mention` 插件。

```js
withMention(editor, options)
```
### placeholder {/*mention-placeholder*/}

`placeholder` 用于配置 `Mention` 插件搜索时候的占位符。

- 类型：`React.ReactNode | ((children: React.ReactElement) => React.ReactElement)`
- 默认值：`无`

- 示例：

```js
withMention(editor, {
  placeholder: 'Search...'
})
```

### triggerChar {/*mention-triggerchar*/}

`triggerChar` 用于配置 `Mention` 插件的触发字符。

- 类型：`string`
- 默认值：`@`

- 示例：

```js
withMention(editor, {
  triggerChar: '#'
})
```

### match {/*mention-match*/}

`match` 用于配置 `Mention` 插件的触发时的节点效验。

- 类型：`(node: Node, path: Path) => boolean`
- 默认值：`无`

- 示例：

```js
withMention(editor, {
  match: (node, path) => {
    return node.type === 'paragraph' && path.length === 1
  }
})
```

### debounceWait {/*mention-debouncewait*/}

`debounceWait` 用于配置 `Mention` 插件的搜索防抖时间。

- 类型：`number`
- 默认值：`100`

- 示例：

```js
withMention(editor, {
  debounceWait: 200
})
```

### debounceMaxWait {/*mention-debouncemaxwait*/}

`debounceMaxWait` 用于配置 `Mention` 插件的搜索防抖最大等待时间。

- 类型：`number`
- 默认值：`1000`

- 示例：

```js
withMention(editor, {
  debounceMaxWait: 2000
})
```

### onSearch {/*mention-onsearch*/}

`onSearch` 用于配置 `Mention` 插件的搜索回调。

- 类型：`(search: string) => Promise<MentionUser[]>`
- 默认值：`无`

- 示例：

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

`onSearchRender` 用于配置 `Mention` 插件的搜索结果渲染。

- 类型：`(users: MentionUser[]) => React.ReactElement`
- 默认值：`无`

- 示例：

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

`onSearchRenderItem` 用于配置 `Mention` 插件的搜索结果渲染。

- 类型：`(user: MentionUser) => React.ReactNode`
- 默认值：`无`

- 示例：

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

`onSearchRenderEmpty` 用于配置 `Mention` 插件的搜索结果为空时的渲染。

- 类型：`() => React.ReactNode`
- 默认值：`无`

- 示例：

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
