---
title: Heading
---

<Intro>

这个页面将向您展示如何使用 `Heading` 插件。

</Intro>

## 安装 Heading {/*heading-install*/}

<TerminalBlock>

npm install @editablejs/plugin-heading

</TerminalBlock>

## 使用 Heading {/*heading-using*/}

<Sandpack deps={['@editablejs/plugin-heading']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withHeading } from '@editablejs/plugin-heading'

const defaultValue = [
  {
    type: 'heading-one',
    children: [{ text: 'Heading 1' }]
  },
  {
    type: 'heading-two',
    children: [{ text: 'Heading 2' }]
  },
  {
    type: 'heading-three',
    children: [{ text: 'Heading 3' }]
  },
  {
    type: 'heading-four',
    children: [{ text: 'Heading 4' }]
  },
  {
    type: 'heading-five',
    children: [{ text: 'Heading 5' }]
  },
  {
    type: 'heading-six',
    children: [{ text: 'Heading 6' }]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withHeading(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## 可选项 {/*heading-options*/}

`withHeading` 接受一个可选的参数，用于配置 `Heading` 插件。

```js
withHeading(editor, options)
```

### enabled/disabled {/*heading-options-enabled*/}

`enabled` 用于配置 `Heading` 插件的某个类型是否可用。

- 类型：`HeadingType[]`
- 默认值：`['heading-one', 'heading-two', 'heading-three', 'heading-four', 'heading-five', 'heading-six']`

```js
withHeading(editor, {
  enabled: ['heading-one', 'heading-two', 'heading-three']
  // disabled: ['heading-one', 'heading-two', 'heading-three']
})
```

### style {/*heading-options-style*/}

`style` 用于配置 `Heading` 插件的某个类型的样式。

通常他需要与 `textMark` 和其它文本插件一起使用。

- 类型：`Partial<Record<HeadingType, Record<HeadingFontStyleName, string>>>`
- 默认值：
  ```ts
  const defaultStyle = {
    [HEADING_ONE_KEY]: {
      fontSize: '28px',
      fontWeight: 'bold',
    },
    [HEADING_TWO_KEY]: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    [HEADING_THREE_KEY]: {
      fontSize: '20px',
      fontWeight: 'bold',
    },
    [HEADING_FOUR_KEY]: {
      fontSize: '16px',
      fontWeight: 'bold',
    },
    [HEADING_FIVE_KEY]: {
      fontSize: '14px',
      fontWeight: 'bold',
    },
    [HEADING_SIX_KEY]: {
      fontSize: '12px',
      fontWeight: 'bold',
    },
  }
  ```
- 示例：

```ts
withHeading(editor, {
  style: {
    'heading-one': {
      fontSize: '32px',
      fontWeight: 'bold',
    },
  }
})
```

### textMark {/*heading-options-textmark*/}

`textMark` 用于配置 `Heading` 插件的某个类型的文本标记属性值。

它用于表示 `style` 选项中的 `fontSize` 和 `fontWeight` 属性将被用于其他插件进行渲染的属性。

- 类型：`Partial<HeadingTextMark>`
- 默认值：
  ```ts
  const defaultTextMark = {
    fontSize: 'fontSize',
    fontWeight: 'bold',
  }
  ```
默认值中的 `fontSize` 属性属于 `@editablejs/plugin-font/size` 插件，如果您需要使用 `fontSize` 属性，您需要先安装该插件。

默认值中的 `bold` 属性来自 @editablejs/plugin-mark 插件，如果您需要使用 `fontWeight` 属性，您需要先安装该插件。

如果您确实不想安装相关插件，您可以编写一个自定义的插件来进行渲染。此外，您也可以使用 `CSS` 直接覆盖 `h1 - h6` 标签的样式来实现这一目的。

- 示例：

```ts
withHeading(editor, {
  textMark: {
    fontSize: 'fontSize',
    fontWeight: 'bold',
  }
})
```

### hotkey {/*heading-options-hotkey*/}

`hotkey` 用于配置 `Heading` 插件的某个类型的快捷键。

- 类型：`HeadingHotkey`
- 默认值:
  ```ts
  const defaultHotkeys: HeadingHotkey = {
    [HEADING_ONE_KEY]: 'mod+opt+1',
    [HEADING_TWO_KEY]: 'mod+opt+2',
    [HEADING_THREE_KEY]: 'mod+opt+3',
    [HEADING_FOUR_KEY]: 'mod+opt+4',
    [HEADING_FIVE_KEY]: 'mod+opt+5',
    [HEADING_SIX_KEY]: 'mod+opt+6',
  }
  ```
- 示例：

```ts
withHeading(editor, {
  hotkey: {
    'heading-one': 'mod+opt+1',
  }
})
```

### shortcuts {/*heading-options-shortcuts*/}

`shortcuts` 用于配置 `Heading` 插件的某个类型的 Markdown 快捷方式。

- 类型：`Record<string, HeadingType>`
- 默认值：
  ```ts
  const defaultShortcuts: Record<string, HeadingType> = {
    '#': 'heading-one',
    '##': 'heading-two',
    '###': 'heading-three',
    '####': 'heading-four',
    '#####': 'heading-five',
    '######': 'heading-six',
  }
  ```
- 示例：

```ts
withHeading(editor, {
  shortcuts: {
    '#': 'heading-one',
  }
})
```
