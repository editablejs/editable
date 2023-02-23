---
title: Mark
---

<Intro>

这个页面将向您展示如何使用 `Mark` 插件。

这个包包含了 `bold`、`italic`、`underline`、`strikethrough`、`code`、`sub`、`sup` 基础的mark样式。

</Intro>

## 安装 Mark {/*mark-install*/}

<TerminalBlock>

npm install @editablejs/plugin-mark

</TerminalBlock>

## 使用 Mark {/*mark-using*/}

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

## 可选项 {/*mark-options*/}

`withMark` 接受一个可选的参数，用于配置 `Mark` 插件。

```js
withMark(editor, options)
```

### enabled/disabled {/*mark-options-enabled-disabled*/}

`enabled` 用于配置 `Mark` 插件是否启用。

- 类型：`MarkFormat[]`
- 默认值：`全部启用`

- 示例：

```ts
withMark(editor, {
  enabled: ['bold', 'italic', 'underline', 'strikethrough', 'code', 'sub', 'sup']
})
```

`disabled` 用于配置 `Mark` 插件是否禁用。

- 类型：`MarkFormat[]`
- 默认值：`无`

- 示例：

```ts
withMark(editor, {
  disabled: ['bold', 'italic', 'underline', 'strikethrough', 'code', 'sub', 'sup']
})
```

### hotkey {/*mark-options-hotkey*/}

`hotkey` 用于配置 `Mark` 插件的快捷键。

- 类型：`MarkHotkey`
- 默认值:
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

- 示例：

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

`shortcuts` 用于配置 `Mark` 插件快捷方式。

- 类型：`Record<string, MarkFormat>`
- 默认值：
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

- 示例：

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
