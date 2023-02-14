# Editable

Editable 是一个可扩展的富文本编辑器框架，专注于稳定性、可控性和性能。为此，我们没有使用原生的可编辑属性[~~contenteditable~~](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable)，而是使用了一个自定义的渲染器，这使得我们可以更好地控制编辑器的行为。从此，您不必再担心跨平台和浏览器兼容性问题（例如`Selection`、`Input`），只需专注于您的业务逻辑。

目前，它仍然是 `beta` 版本，`api` 可能会有比较大的改动，因此相关文档尚未完善。

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

## 开发

```bash
# 安装
pnpm install

# 构建
pnpm build

# 启动
pnpm dev

```

## 任务

### Selection

- [x] 英文键盘输入
- [x] 组合输入法输入
- [x] 光标选区渲染
- [x] 文本输入框渲染
- [x] 拖拽鼠标选择选区与光标
- [x] 通过键盘左右键切换光标和选区
- [x] 通过键盘 Shift+左右键切换光标和选区
- [x] 通过键盘 Shift+上下键切换光标和选区
- [x] 通过键盘 Ctrl+上下键切换光标和选区
- [x] 通过键盘上下键切换光标和选区
- [x] 鼠标双击、三击后分词选中文本
- [x] 触摸选择选区与光标
- [ ] 单元测试全覆盖

### Input

- [x] 组合输入法输入
- [x] 粘贴
- [x] 粘贴为纯文本
- [x] 复制
- [x] 剪切

### Drag

- [x] 拖拽选区文本
- [x] 拖拽文件
- [x] 拖拽节点

### Serializer & Deserializer

- [x] Text
- [x] Html
- [x] Markdown

### Plugins

- [x] Bold
- [x] Italic
- [x] Underline
- [x] StrikeThrough
- [x] Code
- [x] Sub
- [x] Sup
- [x] Fontsize
- [x] OrderedList
- [x] UnorderedList
- [x] TaskList
- [x] Blockquote
- [x] Indent
- [x] Fontcolor
- [x] BackgroundColor
- [x] Redo
- [x] Undo
- [x] Link
- [x] Image
- [x] Codeblock
- [x] Heading
- [x] Table
- [x] Hr
- [x] Toolbar
- [x] InlineToolbar
- [x] SideToolbar
- [x] History
- [x] Yjs
- [x] Yjs-History
- [x] Yjs-Websocket
- [x] Serializes
- [x] ContextMenu
- [x] Leading
- [x] Align
- [x] Mention

### [More](https://github.com/orgs/editablejs/projects/1/views/1)
