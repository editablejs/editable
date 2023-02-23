---
title: Heading
---

<Intro>

This page will show you how to use the `Heading` plugin.

</Intro>

## Installation {/*heading-install*/}

<TerminalBlock>

npm install @editablejs/plugin-heading

</TerminalBlock>

## Usage {/*heading-using*/}

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

## Options {/*heading-options*/}

`withHeading` accepts an optional parameter to configure the `Heading` plugin.

```js
withHeading(editor, options)
```

### enabled/disabled {/*heading-options-enabled*/}

`enabled` is used to configure whether a specific type of `Heading` is enabled.

- Type: `HeadingType[]`
- Default: `['heading-one', 'heading-two', 'heading-three', 'heading-four', 'heading-five', 'heading-six']`

```js
withHeading(editor, {
  enabled: ['heading-one', 'heading-two', 'heading-three']
  // disabled: ['heading-one', 'heading-two', 'heading-three']
})
```

### style {/*heading-options-style*/}

`style` is used to configure the style of a specific type of `Heading`.

Usually it needs to be used together with `textMark` and other text plugins.

- Type: `Partial<Record<HeadingType, Record<HeadingFontStyleName, string>>>`
- Default:
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
- Example:

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

`textMark` is used to configure the text mark of a certain type of text for the Heading plugin.

It represents the `fontSize` and `fontWeight` properties in the `style` option that are used for rendering by other plugins.

- Type: `Partial<HeadingTextMark>`
- Default value:
  ```ts
  const defaultTextMark = {
    fontSize: 'fontSize',
    fontWeight: 'bold',
  }
  ```
The `fontSize` property in the default value belongs to the `@editablejs/plugin-font/size` plugin. If you want `fontSize` to take effect, you need to install it.

The `bold` property in the default value comes from the `@editablejs/plugin-mark` plugin. If you want `fontWeight` to take effect, you need to install it.

If you really don't want to install the related plugins, you can write a custom rendering plugin separately. Additionally, you can use `CSS` to directly override the styles of the `h1-h6` tags.

- Example:

```ts
withHeading(editor, {
  textMark: {
    fontSize: 'fontSize',
    fontWeight: 'bold',
  }
})
```

### hotkey {/*heading-options-hotkey*/}

`hotkey` is used to configure the keyboard shortcut of a certain type of heading for the `Heading` plugin.

- Type:`HeadingHotkey`
- Default:
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
- Example:

```ts
withHeading(editor, {
  hotkey: {
    'heading-one': 'mod+opt+1',
  }
})
```

### shortcuts {/*heading-options-shortcuts*/}

`shortcuts` is used to configure the markdown phrase of a certain type of heading for the `Heading` plugin.

- Type:`Record<string, HeadingType>`
- Default:
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
- Example:

```ts
withHeading(editor, {
  shortcuts: {
    '#': 'heading-one',
  }
})
```
