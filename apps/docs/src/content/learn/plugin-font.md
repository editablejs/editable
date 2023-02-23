---
title: Font
---

<Intro>

This page will show you how to use the `Font` plugin.

This package contains the basic font styles `font-color`, `font-size`, and `background-color`.

</Intro>

## Installation {/*font-install*/}

<TerminalBlock>

npm install @editablejs/plugin-font

</TerminalBlock>

## Usage {/*font-using*/}

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

## FontColor & BackgroundColor Options {/*font-color-options*/}

`withFontColor` and `withBackgroundColor` accept an optional argument to configure the text color and background color.

```js
withFontColor(editor, options)
withBackgroundColor(editor, options)
```
### defaultColor {/*font-options-defaultcolor*/}

`defaultColor` is used to configure the default color.

- Type: `string`
- Default: `None`

- Example:

```ts
withFontColor(editor, {
  defaultColor: '#000000'
})
withBackgroundColor(editor, {
  defaultColor: '#FFFFFF'
})
```

### hotkey {/*font-options-hotkey*/}

`hotkey` is used to configure the hotkeys for text color and background color.

- Type: `FontColorHotkey` | `BackgroundColorHotkey`
- Default:  `None`

- Example:

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

## FontSize Options {/*font-size-options*/}

`withFontSize` accepts an optional argument to configure the text size.

```js
withFontSize(editor, options)
```
### defaultSize {/*font-options-defaultsize*/}

`defaultSize` is used to configure the default font size.

- Type: `string`
- Default:  `None`

- Example:

```ts
withFontSize(editor, {
  defaultSize: '16px'
})
```
