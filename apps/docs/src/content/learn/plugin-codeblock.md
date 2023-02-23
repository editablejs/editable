---
title: CodeBlock
---

<Intro>

This page will show you how to use the `CodeBlock` plugin.

</Intro>

## Installation {/*codeblock-install*/}

<TerminalBlock>

npm install @editablejs/plugin-codeblock

</TerminalBlock>

## Usage {/*codeblock-using*/}

`CodeBlock` uses `CodeMirror` as the code editor, so you need to install the `CodeMirror` language pack.

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

## Options {/*codeblock-options*/}

`withCodeBlock` takes an optional argument for configuring the `CodeBlock` plugin.

```js
withCodeBlock(editor, options)
```

### languages {/*codeblock-options-languages*/}

`languages` is used to configure the language options for the `CodeBlock` plugin.

- Type: `{
    value: string
    content?: string
    plugin?: LanguageSupport
  }[]`

- Default: `[]`

### plugins {/*codeblock-options-plugins*/}

`plugins` is used to configure additional `CodeMirror` plugins.

- Type: `Extension[]`
- Default: `[]`

### locale {/*codeblock-options-locale*/}

`locale` is used to configure internationalization for the `CodeBlock` plugin.

- Type: `Record<string, CodeBlockLocale>`
- Default:
  ```ts
  const defaultLocale: Record<string, CodeBlockLocale> = {
    locale: 'en-US',
    codeblock: {
      toolbar: {
        language: {
          title: 'Language',
          searchEmpty: 'No language found',
        },
        theme: {
          title: 'Theme',
          light: 'Light',
          dark: 'Dark',
        },
        lineWrapping: {
          title: 'Line wrapping',
          autoWrap: 'Auto wrap',
          overflow: 'Overflow',
        },
        tabSize: 'Tab size',
      },
    },
  }
  ```

### hotkey {/*codeblock-options-hotkey*/}

`hotkey` is used to configure the shortcut key for a certain center mode of the `CodeBlock` plugin.

- Type: `CodeBlockHotkey`
- Default: `None`

- Example:

```ts
withCodeBlock(editor, {
  hotkey: 'mod+shift+c'
})
```
### shortcuts {/*heading-options-shortcuts*/}

`shortcuts` is used to configure shortcuts for the `CodeBlock` plugin.

- Type: `string[]`
- Default:
  ```ts
  const defaultShortcuts: string[] = ['```']
  ```
- Example:

```ts
withCodeBlock(editor, {
  shortcuts: ['```']
})
```
