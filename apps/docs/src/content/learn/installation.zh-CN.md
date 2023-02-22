---
title: 安装
---

<Intro>

这个页面将向您展示如何将 Editable 编辑器集成到您的 React 项目中。

</Intro>

## 步骤 1: 安装 Editable {/*step-1*/}

<TerminalBlock>

npm install @editablejs/models @editablejs/editor

</TerminalBlock>

您还需要将 React 作为依赖项。

<TerminalBlock>

npm install react react-dom

</TerminalBlock>

## 步骤 2: 导入 Editable {/*step-2*/}

```js

import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'

```

## 步骤 3: 创建一个 Editor 对象 {/*step-3*/}

在使用这些导入之前，让我们从一个空的 `<App />` 开始。

我们希望编辑器在渲染过程中保持稳定，因此我们使用具有空依赖项的 `useMemo` hook。

```js
const App = () => {
   const editor = React.useMemo(() => {
     return withEditable(createEditor())
   }, [])
   return null
}

```

当然，我们没有渲染任何内容，所以您看不到任何变化。

## 步骤 4: 使用编辑器的上下文提供者 `EditableProvider` {/*step-4*/}

您可以将 `<EditableProvider>` 组件视为为其下方的每个组件提供上下文。

```js
const App = () => {
   const editor = React.useMemo(() => {
     return withEditable(createEditor())
   }, [])
   return <EditableProvider editor={editor} />
}

```

通过共享上下文，您可以使用 `useEditable` 和 `useEditableStatic` 钩子在其他组件中访问编辑器对象。

## Step 5: 渲染可编辑区域 `ContentEditable` {/*step-5*/}

`ContentEditable` 组件是一个可编辑区域，其行为类似于 `contenteditable。`

不同之处在于，我们不使用 `contenteditable` 属性，并且对其的任何行为都是可预期且可控的。

`Editable` 接管了大多数按键和鼠标事件，以模拟可编辑的交互行为（包括输入行为）。

```js
const App = () => {
   const editor = React.useMemo(() => {
     return withEditable(createEditor())
   }, [])
   return <EditableProvider editor={editor}>
     <ContentEditable />
   </EditableProvider>
}

```

最后，您可以在页面中看到一个可编辑区域，并尝试对其进行编辑。此外，页面上没有任何支持 `contenteditable` 或本地可编辑属性的元素。

## 下一步 {/*next-steps*/}

前往 [使用插件](/learn/using-plugins) 指南了解如何使用 Editable 的插件。
