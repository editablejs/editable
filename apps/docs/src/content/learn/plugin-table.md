---
title: Table
---

<Intro>

This page will show you how to use the `Table` plugin.

</Intro>

## Installation {/*table-install*/}

<TerminalBlock>

npm install @editablejs/plugin-table

</TerminalBlock>

## Usage {/*table-using*/}

<Sandpack deps={['@editablejs/plugin-table']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withTable } from '@editablejs/plugin-table'

const defaultValue = [
  {
    type: 'table',
    colsWidth: [120, 120, 120],
    children: [
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: 'cell 1',
                  },
                ],
              },
            ],
          },
          {
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: 'cell 2',
                  },
                ],
              },
            ],
          },
          {
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: 'cell 3',
                  },
                ],
              },
            ],
          },
        ],
        height: 35,
      }
      ]
    }
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withTable(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## Options {/*table-options*/}

`withTable` accepts an optional parameter to configure the `Table` plugin.

```js
withTable(editor, options)
```

### locale {/*table-options-locale*/}

`locale` is used to configure internationalization for the `Table` plugin.

- Type: `Record<string, TableLocale>`
- Default:
  ```ts
  const defaultLocale: Record<string, TableLocale> ={
    locale: 'en-US',
    table: {
      mergeCells: 'Merge cells',
      splitCells: 'Split cells',
      moveRows: 'Moving {count} rows',
      moveCols: 'Moving {count} columns',
    },
  }
  ```

### shortcuts {/*table-options-shortcuts*/}

`shortcuts` is used to configure shortcuts for the `Table` plugin.

- Type: `boolean`
- Default: `true`

- Example:

```ts
withTable(editor, {
  shortcuts: true
})
```
