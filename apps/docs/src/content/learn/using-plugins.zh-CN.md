---
title: 使用插件
---

<Intro>

这个页面将向您展示如何将 Editable 的插件集成到编辑器中。

</Intro>

## 步骤 1: 安装 `@editablejs/plugins` {/*step-1*/}

这是一个常用插件的集合包，它与其它单独的插件使用方式是一样的。

<TerminalBlock>

npm install @editablejs/models @editablejs/editor @editablejs/plugins

</TerminalBlock>


## 步骤 2: 导入插件 {/*step-2*/}

```js

import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withPlugins } from '@editablejs/plugins'

```

## 步骤 3: 使用 `withPlugins` {/*step-3*/}

```js
const App = () => {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withPlugins(editor)
  }, [])

  return (
    <EditableProvider editor={editor}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

## 尝试使用插件 {/*try-plugins*/}

下面的沙箱已经使用了 `@editablejs/plugins`，您可以在其中尝试使用插件。

插件中已经实现了`快捷键`、`markdown语法` 等相关功能，你可以这样尝试：

- 使用 `Ctrl + B` 将选中的文本加粗
- 输入 `#` + 空格 将文本转换为标题
- ...

<Sandpack deps={['@editablejs/plugins']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withPlugins } from '@editablejs/plugins'

export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withPlugins(editor)
  }, [])

  return (
    <EditableProvider editor={editor}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>


## 下一步 {/*next-steps*/}

前往 [工具栏](/learn/toolbar) 指南了解如何配置使用工具栏。
