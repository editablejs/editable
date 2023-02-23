---
title: Font
---

<Intro>

这个页面将向您展示如何使用 `Font` 插件。

这个包包含了 `font-color`、`font-size`、`background-color` 基础的font样式。

</Intro>

## 安装 Font {/*font-install*/}

<TerminalBlock>

npm install @editablejs/plugin-font

</TerminalBlock>

## 使用 Font {/*font-using*/}

<Sandpack deps={['@editablejs/plugin-font']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withFontColor } from '@editablejs/plugin-font/color'
import { withFontSize } from '@editablejs/plugin-font/size'
import { withBackgroundColor } from '@editablejs/plugin-font/background-color'

const defaultValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'You can write in ',
      },
      {
        fontColor: '#ff0000',
        text: 'red',
      },
      {
        text: ', write in ',
      },
      {
        fontSize: '24px',
        text: '24px',
      },
      {
        text: ', write in ',
      },
      {
        backgroundColor: '#00ff00',
        text: 'green',
      },
      {
        text: ', write in ',
      },
      {
        text: 'normal',
      },
    ],
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withBackgroundColor(withFontSize(withFontColor(editor)))
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## FontColor & BackgroundColor 可选项 {/*font-color-options*/}

`withFontColor` 和 `withBackgroundColor` 接受一个可选的参数，用于配置文本的颜色和背景色。

```js
withFontColor(editor, options)
withBackgroundColor(editor, options)
```
### defaultColor {/*font-options-defaultcolor*/}

`defaultColor` 用于配置默认的颜色。

- 类型：`string`
- 默认值: `无`

- 示例：

```ts
withFontColor(editor, {
  defaultColor: '#000000'
})
withBackgroundColor(editor, {
  defaultColor: '#FFFFFF'
})
```

### hotkey {/*font-options-hotkey*/}

`hotkey` 用于配置文本颜色和背景色的快捷键。

- 类型：`FontColorHotkey` | `BackgroundColorHotkey`
- 默认值: `无`

- 示例：

```ts
withFontColor(editor, {
  hotkey: {
    'red': 'mod+shift+c'
  }
})
withBackgroundColor(editor, {
  hotkey: {
    'blue': 'mod+shift+b'
  }
})
```

## FontSize 可选项 {/*font-size-options*/}

`withFontSize` 接受一个可选的参数，用于配置文本的大小。

```js
withFontSize(editor, options)
```
### defaultSize {/*font-options-defaultsize*/}

`defaultSize` 用于配置默认的大小。

- 类型：`string`
- 默认值: `无`

- 示例：

```ts
withFontSize(editor, {
  defaultSize: '16px'
})
```
