---
title: Table
---

<Intro>

这个页面将向您展示如何使用 `Table` 插件。

</Intro>

## 安装 Table {/*table-install*/}

<TerminalBlock>

npm install @editablejs/plugin-table

</TerminalBlock>

## 使用 Table {/*table-using*/}

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

## 可选项 {/*table-options*/}

`withTable` 接受一个可选的参数，用于配置 `Table` 插件。

```js
withTable(editor, options)
```

### locale {/*table-options-locale*/}

`locale` 用于配置 `Table` 插件的国际化。

- 类型：`Record<string, TableLocale>`
- 默认值：
  ```ts
  const defaultLocale: Record<string, TableLocale> ={
    locale: 'zh-CN',
    table: {
      mergeCells: '合并单元格',
      splitCells: '拆分单元格',
      moveRows: '正在移动{count}行',
      moveCols: '正在移动{count}列',
    },
  }
  ```

### shortcuts {/*table-options-shortcuts*/}

`shortcuts` 用于配置 `Table` 插件快捷方式。

- 类型：`boolean`
- 默认值：`true`

- 示例：

```ts
withTable(editor, {
  shortcuts: true
})
```
