---
title: CodeBlock
---

<Intro>

这个页面将向您展示如何使用 `CodeBlock` 插件。

</Intro>

## 安装 CodeBlock {/*codeblock-install*/}

<TerminalBlock>

npm install @editablejs/plugin-codeblock

</TerminalBlock>

## 使用 CodeBlock {/*codeblock-using*/}

`CodeBlcok` 使用 `CodeMirror` 作为代码编辑器，因此您需要安装 `CodeMirror` 语言包。

<Sandpack deps={['@editablejs/plugin-codeblock', '@codemirror/lang-javascript', '@codemirror/lang-html', '@codemirror/lang-css']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withCodeBlock } from '@editablejs/plugin-codeblock'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'

const defaultValue = [
  {
    type: 'codeblock',
    language: 'javascript',
    code: 'console.log("hello world")',
    children: [{ text: '' }]
  }
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withCodeBlock(editor, {
      languages: [
          {
            value: 'plain',
            content: 'Plain text',
          },
          {
            value: 'javascript',
            content: 'JavaScript',
            plugin: javascript(),
          },
          {
            value: 'html',
            content: 'HTML',
            plugin: html(),
          },
          {
            value: 'css',
            content: 'CSS',
            plugin: css(),
          },
        ],
    })
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## 可选项 {/*codeblock-options*/}

`withCodeBlock` 接受一个可选的参数，用于配置 `CodeBlock` 插件。

```js
withCodeBlock(editor, options)
```

### languages {/*codeblock-options-languages*/}

`languages` 用于配置 `CodeBlock` 插件的语言选项。

- 类型：`{
    value: string
    content?: string
    plugin?: LanguageSupport
  }[]`

- 默认值：`[]`

### plugins {/*codeblock-options-plugins*/}

`plugins` 用于配置额外的 `CodeMirror` 插件。

- 类型：`Extension[]`
- 默认值：`[]`

### locale {/*codeblock-options-locale*/}

`locale` 用于配置 `CodeBlock` 插件的国际化。

- 类型：`Record<string, CodeBlockLocale>`
- 默认值：
  ```ts
  const defaultLocale: Record<string, CodeBlockLocale> ={
    locale: 'zh-CN',
    codeblock: {
      toolbar: {
        language: {
          title: '语言',
          searchEmpty: '未找到语言',
        },
        theme: {
          title: '主题',
          light: '浅色主题',
          dark: '深色主题',
        },
        lineWrapping: {
          title: '换行',
          autoWrap: '自动换行',
          overflow: '内容溢出',
        },
        tabSize: '缩进大小',
      },
    },
  }
  ```

### hotkey {/*codeblock-options-hotkey*/}

`hotkey` 用于配置 `CodeBlock` 插件的某个居中模式的快捷键。

- 类型：`CodeBlockHotkey`
- 默认值: `无`

- 示例：

```ts
withCodeBlock(editor, {
  hotkey: 'mod+shift+c'
})
```
### shortcuts {/*heading-options-shortcuts*/}

`shortcuts` 用于配置 `CodeBlock` 插件快捷方式。

- 类型：`string[]`
- 默认值：
  ```ts
  const defaultShortcuts: string[] = ['```']
  ```
- 示例：

```ts
withCodeBlock(editor, {
  shortcuts: ['```']
})
```
