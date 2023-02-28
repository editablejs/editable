---
title: 快速开始
---

<Intro>

在学习如何使用 `Editable` 之前，您可能需要了解一些基本概念。

- 数据模型依赖于 [Slate](https://docs.slatejs.org/)，它的数据模型与 DOM 树结构平行，我们几乎所有的操作都将应用于它，因此您可能需要了解 [Slate](https://docs.slatejs.org/) 的基本概念。

- 视图渲染依赖于 [React](https://reactjs.org) 和 [React Hooks](https://reactjs.org/docs/hooks-intro.html)，它们负责将编辑器数据渲染为 DOM 节点。

</Intro>

<YouWillLearn>

- 如何安装 `Editable` npm 包
- 如何创建编辑器实例
- 如何使用 `React` 渲染可编辑区域
- 如何使用插件
- 如何配置工具栏

</YouWillLearn>

## 尝试 Editable {/*try-editable*/}

在学习之前，您无需安装任何东西即可使用 Editable 进行实验。请尝试编辑这个沙箱！

<Sandpack>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'

export default function App() {
  const editor = React.useMemo(() => {
    return withEditable(createEditor())
  }, [])

  return (
    <EditableProvider editor={editor}>
      <ContentEditable placeholder="Please enter content..." />
    </EditableProvider>
  )
}

```

</Sandpack>

您可以直接编辑它，也可以通过点击右上角的“Fork”按钮在新标签页中打开它。

## 下一步 {/*next-steps*/}

前往 [安装](/learn/installation) 指南了解如何安装 Editable。

