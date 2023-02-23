---
title: Hr
---

<Intro>

这个页面将向您展示如何使用 `Hr` 插件。

</Intro>

## 安装 Hr {/*hr-install*/}

<TerminalBlock>

npm install @editablejs/plugin-hr

</TerminalBlock>

## 使用 Hr {/*hr-using*/}

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

## 可选项 {/*hr-options*/}

`withHr` 接受一个可选的参数，用于配置 `Hr` 插件。

```js
withHr(editor, options)
```

### locale {/*hr-options-locale*/}

`locale` 用于配置 `Hr` 插件的国际化。

- 类型：`Record<string, HrLocale>`
- 默认值：
  ```ts
  const defaultLocale: Record<string, HrLocale> ={
    locale: 'zh-CN',
    hr: {
      toolbar: {
        defaultColor: '默认颜色',
        color: '颜色',
        style: '样式',
        width: '粗细',
      },
    },
  }
  ```

### hotkey {/*hr-options-hotkey*/}

`hotkey` 用于配置 `Hr` 插件的快捷键。

- 类型：`HrHotkey`
- 默认值: `mod+shift+e`

- 示例：

```ts
withHr(editor, {
  hotkey: {
    'hr': 'mod+shift+e',
  }
})
```

### shortcuts {/*table-options-shortcuts*/}

`shortcuts` 用于配置 `Hr` 插件快捷方式。

- 类型：`string[]`
- 默认值：`['*', '-']`

- 示例：

```ts
withHr(editor, {
  shortcuts: ['*', '-']
})
```
