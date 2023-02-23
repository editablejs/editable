---
title: Link
---

<Intro>

这个页面将向您展示如何使用 `Link` 插件。

</Intro>

## 安装 Link {/*link-install*/}

<TerminalBlock>

npm install @editablejs/plugin-link

</TerminalBlock>

## 使用 Link {/*link-using*/}

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

## 可选项 {/*link-options*/}

`withLink` 接受一个可选的参数，用于配置 `Link` 插件。

```js
withLink(editor, options)
```

### locale {/*link-options-locale*/}

`locale` 用于配置 `Link` 插件的国际化。

- 类型：`Record<string, LinkLocale>`
- 默认值：
  ```ts
  const defaultLocale: Record<string, LinkLocale> ={
    locale: 'zh-CN',
    link: {
      link: '链接',
      linkPlaceholder: '粘贴或输入一个链接',
      text: '文本',
      textPlaceholder: '输入内容描述',
      ok: '确定',
      cancelLink: '取消链接',
    },
  }
  ```

### hotkey {/*link-options-hotkey*/}

`hotkey` 用于配置 `Link` 插件的快捷键。

- 类型：`LinkHotkey`
- 默认值: `mod+k`

- 示例：

```ts
withLink(editor, {
  hotkey: {
    'link': 'mod+k',
  }
})
```

### shortcuts {/*table-options-shortcuts*/}

`shortcuts` 用于配置 `Link` 插件快捷方式。

- 类型：`boolean`
- 默认值：`true`

- 示例：

```ts
withLink(editor, {
  shortcuts: true
})
```
