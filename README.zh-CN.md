# Editable

一个实验性的富文本编辑器框架，希望通过自绘光标来替代原生 contenteditable 属性，提供更丰富、稳定的编辑能力。

## 开发

```bash
# 安装
pnpm install

# 启动
pnpm dev

```

### Yjs

`pnpm dev` 启动后，访问 `/yjs`

## 目录结构

所有源代码都在 packages 里面，apps 目录主要用作文档和测试用例，现在初始开发阶段里面写了一个 React 渲染编辑器模型、以及模型更新的逻辑，方便可视化测试。

### packages/breaker

主要对一些 `unicode` 字符进行索引的计算。因为有些字符占位所占的字节数不确定，造成某些字符拆分后的索引不准确，所以需要这个工具包来解决这个问题。

### packages/editor

使用 slatejs 数据模型，借助 react 使用自绘光标的模式渲染，不再依赖 contenteditable 属性

### packages/plugins

插件目录

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
- [ ] 触摸选择选区与光标
- [ ] 单元测试全覆盖

### Input

- [x] 组合输入法输入

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
- [x] UnOrderedList
- [x] TaskList
- [x] Blockquote
- [x] Indent
- [ ] Fontcolor
- [ ] BackgroundColor
- [ ] Redo
- [ ] Undo
- [ ] Link
- [ ] Image
- [ ] Codeblock
- [x] Heading
- [ ] Table
- [ ] Hr
- [x] Toolbar
- [x] Yjs
- [x] Serializes
- [x] ContextMenu
- [x] Clipboard
- [ ] Drag
