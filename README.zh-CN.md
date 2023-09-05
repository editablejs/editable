# Editable

Editable 是一个可扩展的富文本编辑器框架，专注于稳定性、可控性和性能。为此，我们没有使用原生的可编辑属性[~~contenteditable~~](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable)，而是使用了一个自定义的渲染器，这使得我们可以更好地控制编辑器的行为。从此，您不必再担心跨平台和浏览器兼容性问题（例如`Selection`、`Input`），只需专注于您的业务逻辑。

## 预览
![preview](/assets/preview.png)

您可以在此处查看演示：https://docs.editablejs.com/playground

---

- 为什么没有使用 `canvas` 渲染？

  虽然`canvas`渲染的性能可能比dom渲染更快，但是canvas的开发体验不佳，需要编写更多代码。

- 为什么使用React渲染？

  `React` 使插件变得更加灵活，且生态很好。但是，`React` 的性能不如原生DOM。

  在富文本中我理想中的前端框架应该是这样的：

  1. 没有虚拟DOM
  2. 没有diff算法
  3. 没有proxy对象

  因此，我比较了`Vue`、`Solid-js`、`SvelteJS`等前端框架，发现`Solid-js`符合前两个条件，但每个属性都会被`proxy`包装，这在做扩展时可能会与纯JS对象做`===`比对时出现问题。

  为了提高性能，我们很可能会在后续的开发中将其重构为原生DOM渲染。

目前，React满足以下两个标准：

- [x] 开发体验
- [x] 插件扩展性
- [ ] 跨前端兼容性
- [ ] 渲染性能

在后续的重构选择中，我们会尽量平衡以上这四个标准。

## 快速开始

> 当前版本你仍然需要与`React`一起使用，但是我们会在后续版本中将其重构为原生DOM渲染。

安装 `@editablejs/models` 和 `@editablejs/editor` 依赖：

```bash
npm i --save @editablejs/models @editablejs/editor
```

下面是一个最小可以编辑文本编辑器：

```tsx
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'

const App = () => {

  const editor = React.useMemo(() => withEditable(createEditor()), [])

  return (
  <EditableProvider editor={editor}>
    <ContentEditable placeholder="Please enter content..." />
  </EditableProvider>)
}
```

## 数据模型

`@editablejs/models` 提供了一个数据模型，用于描述编辑器的状态，以及对编辑器状态的操作。

```ts
{
  type: 'paragraph',
  children: [
    {
      type: 'text',
      text: 'Hello World'
    }
  ]
}
```

可以看到他的结构与[`Slate`](https://github.com/ianstormtaylor/slate)非常相似，我们没有新建一个数据模型，而是直接使用了`Slate`的数据模型，并对它进行了一定的扩展（增加了`Grid`、`List`相关数据结构和操作），依赖这些成熟优秀的数据结构可以使我们的编辑器更加稳定。

我们把`Slate`的所有`api`都封装到了`@editablejs/models`中，因此`Slate`的`api`你都可以从`@editablejs/models`中找到。

如果你对`Slate`不太熟悉，可以查看它的文档：https://docs.slatejs.org/

## 插件

当前我们提供了一些开箱即用的插件，除了实现了基本的功能外，还实现了`键盘快捷键`、`markdown短语`、`markdown序列化`、`markdown反序列`、`HTML序列化`、`HTML反序列化`。

### 常用插件

- `@editablejs/plugin-context-menu` 提供了一个上下文菜单，由于我们没有使用 ~~`contenteditble`~~ 原生菜单的部分功能不再起作用，所以我们需要自己定义上下文菜单的功能。
- `@editablejs/plugin-align` 对齐
- `@editablejs/plugin-blockquote` 引用块
- `@editablejs/plugin-codeblock` 代码块
- `@editablejs/plugin-font` 包含了前景色、背景色、字体大小
- `@editablejs/plugin-heading` 标题
- `@editablejs/plugin-hr` 分割线
- `@editablejs/plugin-image` 图片
- `@editablejs/plugin-indent` 缩进
- `@editablejs/plugin-leading` 行距
- `@editablejs/plugin-link` 链接
- `@editablejs/plugin-list` 包含了有序列表、无序列表、任务列表
- `@editablejs/plugin-mark` 包含了加粗、斜体、删除线、下划线、上标、下标、行内代码
- `@editablejs/plugin-mention` 提及
- `@editablejs/plugin-table` 表格

单个插件的使用方法，以 `plugin-mark` 为例：

```tsx
import { withMark } from '@editablejs/mark'

const editor = React.useMemo(() => {
  const editor = withEditable(createEditor())
  return withMark(editor)
}, [])
```

上面的常用插件您还可以通过`@editablejs/plugins`中的`withPlugins`方法来快速使用：

```tsx
import { withPlugins } from '@editablejs/plugins'

const editor = React.useMemo(() => {
  const editor = withEditable(createEditor())
  return withPlugins(editor)
}, [])

```

### 历史插件

`@editablejs/plugin-history` 插件提供了撤销、重做功能。

```tsx
import { withHistory } from '@editablejs/plugin-history'

const editor = React.useMemo(() => {
  const editor = withEditable(createEditor())
  return withHistory(editor)
}, [])
```

### 标题插件

一般我们在开发文档、博客的应用时，我们会有一个标题与主体内容是分开的，它通常会在编辑器外使用 `input` 或者 `textarea` 来实现。如果在协作环境中，由于是独立于编辑器外部的，要实现标题的实时同步，就需要做额外的工作。

`@editablejs/plugin-title` 插件就是为了解决这个问题的，它将编辑器的第一个子节点作为标题，融于编辑器整个数据结构中，这样它就可以拥有编辑器所拥有的特性了。

```tsx
import { withTitle } from '@editablejs/plugin-title'
const editor = React.useMemo(() => {
  const editor = withEditable(createEditor())
  return withTitle(editor)
}, [])
```
它也有一个独立的 `placeholder` 属性，用于设置标题的占位符。

```tsx
return withTitle(editor, {
  placeholder: '请输入标题'
})
```

### Yjs 插件

`@editablejs/plugin-yjs` 插件提供了对`Yjs`的支持，它可以将编辑器的数据实时同步到其他客户端。

你需要安装下面的依赖：

- `yjs` yjs 的核心库
- `@editablejs/yjs-websocket` yjs 的 websocket 通信库

  另外它还提供了`nodejs`服务端的实现，你可以使用它来搭建一个 `yjs` 的服务：
   ```ts
    import startServer from '@editablejs/yjs-websocket/server'

    startServer()
    ```
- `@editablejs/plugin-yjs` 与编辑器一起使用的 `yjs` 插件


```bash
npm i yjs @editablejs/yjs-websocket @editablejs/plugin-yjs
```

<details>
  <summary>使用方法：</summary>
<p>

```tsx
import * as Y from 'yjs'
import { withYHistory, withYjs, YjsEditor, withYCursors, CursorData, useRemoteStates } from '@editablejs/plugin-yjs'
import { WebsocketProvider } from '@editablejs/yjs-websocket'

// 创建一个yjs的文档
const document = React.useMemo(() => new Y.Doc(), [])
// 创建一个 websocket 的 provider
const provider = React.useMemo(() => {
  return typeof window === 'undefined'
      ? null
      : new WebsocketProvider(yjs服务端地址, 'editable', document, {
          connect: false,
        })
}, [document])
// 创建一个编辑器
const editor = React.useMemo(() => {
  // 获取yjs文档中的content字段，它是一个XmlText类型
  const sharedType = document.get('content', Y.XmlText) as Y.XmlText
  let editor = withYjs(withEditable(createEditor()), sharedType, { autoConnect: false })
  if (provider) {
    // 与其他客户端的光标同步
    editor = withYCursors(editor, provider.awareness, {
      data: {
        name: '张三',
        color: '#f00',
      },
    })
  }
  // 历史记录
  editor = withHistory(editor)
  // yjs 的历史记录
  editor = withYHistory(editor)
}, [provider])

// 连接到yjs服务端
React.useEffect(() => {
  provider?.connect()
  return () => {
    provider?.disconnect()
  }
}, [provider])
```
</p>
</details>

### 自定义插件

创建一个自定义插件非常简单，我们只需要拦截 `renderElement` 方法，然后判断当前节点是否是我们需要的节点，如果是，就渲染我们自定义的组件。

<details>
  <summary>一个自定义插件的例子：</summary>
<p>

```tsx
import { Editable } from '@editablejs/editor'
import { Element, Editor } from '@editablejs/models'

// 定义一个插件的类型
export interface MyPlugin extends Element {
  type: 'my-plugin'
  // ... 您还可以自定义一些其它属性
}

export const MyPlugin = {
  // 判断一个节点是否是 MyPlugin 的插件
  isMyPlugin(editor: Editor, element: Element): element is MyPlugin {
    return Element.isElement(value) && element.type === 'my-plugin'
  }
}

export const withMyPlugin = <T extends Editable>(editor: T) => {
  const { isVoid, renderElement } = editor
  // 拦截 isVoid 方法，如果是 MyPlugin 的节点，就返回 true
  // 除了 isVoid 方法，还有 `isBlock` `isInline` 等方法，可以按需要拦截
  editor.isVoid = element => {
    return MyPlugin.isMyPlugin(editor, element) || isVoid(element)
  }
  // 拦截 renderElement 方法，如果是 MyPlugin 的节点，就渲染自定义的组件
  // attributes 是节点的属性，我们需要将它传递给自定义组件
  // children 是节点的子节点，里面包含了节点的子节点，我们必须要渲染它
  // element 是当前节点，你可以在里面找到你自定义的属性
  editor.renderElement = ({ attributes, children, element }) => {
    if (MyPlugin.isMyPlugin(editor, element)) {
      return <div {...attributes}>
        <div>My Plugin</div>
        {children}
        </div>
    }
    return renderElement({ attributes, children, element })
  }

  return editor
}
```
</p>
</details>

### 序列化

`@editablejs/serializer` 提供了一个序列化器，它可以将编辑器的数据序列化为 `html`，`text`，`markdown` 格式。

当前提供的插件都已经实现了序列化的转换器，你可以直接使用。

<details>
<summary>HTML 序列化</summary>
<p>

```tsx
// html 序列化器
import { HTMLSerializer } from '@editablejs/serializer/html'
// 导入 plugin-mark 插件的HTML序列化转换器，其它插件同理
import { withMarkHTMLSerializerTransform } from '@editablejs/plugin-mark/serializer/html'
// 使用转换器
HTMLSerializer.withEditor(editor, withMarkHTMLSerializerTransform, {})
// 序列化成 HTML
const html = HTMLSerializer.transformWithEditor(editor, { type: 'paragraph', children: [{ text: 'hello', bold: true }] })
// output: <p><strong>hello</strong></p>
```
</p>
</details>

<details>
<summary>Text 序列化</summary>
<p>

```tsx
// text 序列化器
import { TextSerializer } from '@editablejs/serializer/text'
// 导入 plugin-mention 插件的 Text 序列化转换器
import { withMentionTextSerializerTransform } from '@editablejs/plugin-mention/serializer/text'
// 使用转换器
TextSerializer.withEditor(editor, withMentionTextSerializerTransform, {})
// 序列化成 Text
const text = TextSerializer.transformWithEditor(editor, { type: 'paragraph', children: [{ text: 'hello' }, {
  type: 'mention',
  children: [{ text: '' }],
  user: {
    name: '张三',
    id: '1',
  },
}] })
// output: hello @张三
```
</p>
</details>

<details>
<summary>Markdown 序列化</summary>
<p>

```tsx
// markdown 序列化器
import { MarkdownSerializer } from '@editablejs/serializer/markdown'
// 导入 plugin-mark 插件的 Markdown 序列化转换器
import { withMarkMarkdownSerializerTransform } from '@editablejs/plugin-mark/serializer/markdown'
// 使用转换器
MarkdownSerializer.withEditor(editor, withMarkMarkdownSerializerTransform, {})
// 序列化成 Markdown
const markdown = MarkdownSerializer.transformWithEditor(editor, { type: 'paragraph', children: [{ text: 'hello', bold: true }] })
// output: **hello**
```
</p>
</details>

每个插件都需要去导入它的序列化转换器，这样太繁琐了，所以我们在 `@editablejs/plugins` 中提供了它内置所有插件的序列化转换器。

```tsx
import { withHTMLSerializerTransform } from '@editablejs/plugins/serializer/html'
import { withTextSerializerTransform } from '@editablejs/plugins/serializer/text'
import { withMarkdownSerializerTransform, withMarkdownSerializerPlugin } from '@editablejs/plugins/serializer/markdown'

useLayoutEffect(() => {
  withMarkdownSerializerPlugin(editor)
  withTextSerializerTransform(editor)
  withHTMLSerializerTransform(editor)
  withMarkdownSerializerTransform(editor)
}, [editor])
```

### 反序列化

`@editablejs/serializer` 提供了一个反序列化器，它可以将 `html`，`text`，`markdown` 格式的数据反序列化为编辑器的数据。

当前提供的插件都已经实现了反序列化的转换器，你可以直接使用。

使用方法与序列化类似，只是导入包的路径需要从 `@editablejs/serializer` 改为 `@editablejs/deserializer`。

## 贡献 ✨

欢迎 🌟 Stars 和 📥 PR！，共同构建更好的富文本编辑器！

[贡献指南](CONTRIBUTING.zh-CN.md) 在这里，欢迎阅读。如果你有不错的插件，欢迎分享给我们。

特别感谢 [Sparticle](https://www.sparticle.com) 的支持，为开源事业做出了贡献。

[![sparticle](/assets/sparticle-logo.png)](https://www.sparticle.com)

最后，感谢所有为这个项目做出贡献的人！（[emoji key](https://allcontributors.org/docs/en/emoji-key)）：

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://claviering.github.io/"><img src="https://avatars.githubusercontent.com/u/16227832?v=4?s=100" width="100px;" alt="Kevin Lin"/><br /><sub><b>Kevin Lin</b></sub></a><br /><a href="https://github.com/big-camel/Editable/commits?author=claviering" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://yaokailun.github.io/"><img src="https://avatars.githubusercontent.com/u/11460856?v=4?s=100" width="100px;" alt="kailunyao"/><br /><sub><b>kailunyao</b></sub></a><br /><a href="https://github.com/big-camel/Editable/commits?author=YaoKaiLun" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ren-chen2021"><img src="https://avatars.githubusercontent.com/u/88533891?v=4?s=100" width="100px;" alt="ren.chen"/><br /><sub><b>ren.chen</b></sub></a><br /><a href="https://github.com/big-camel/Editable/commits?author=ren-chen2021" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/byoungd"><img src="https://avatars.githubusercontent.com/u/16145783?v=4?s=100" width="100px;" alt="han"/><br /><sub><b>han</b></sub></a><br /><a href="https://github.com/big-camel/Editable/commits?author=byoungd" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

该项目遵循 [all-contributors](https://github.com/all-contributors/all-contributors) 规范，欢迎任何形式的贡献！
## 感谢

我们还要感谢这些提供帮助的开源项目：

- [Slate](https://github.com/ianstormtaylor/slate) - 提供数据模型的支持。
- [Yjs](https://github.com/yjs/yjs) - CRDTs 的基本支持，用于我们在协作编辑的支持。
- [React](https://github.com/facebook/react) - 视图层支持。
- [Zustand](https://github.com/pmndrs/zustand) - 前端的最小状态管理工具。
- [其他依赖项](https://github.com/editablejs/editable/network/dependencies)


我们使用以下开源项目来帮助我们构建更好的开发体验：

- [Turborepo](https://github.com/vercel/turbo) -- pnpm + turbo 是很棒的 monorepo 管理器和构建系统

## License

查看 [LICENSE](https://github.com/editablejs/editable/blob/main/LICENSE) 详情。
