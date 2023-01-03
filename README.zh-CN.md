# Editable

一个实验性的富文本编辑器框架，希望通过自绘光标来替代原生 contenteditable 属性，提供更丰富、稳定的编辑能力。

演示：https://docs.editablejs.com/playground

## 开发

```bash
# 安装
pnpm install

# 启动
pnpm dev

```

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
- [x] 触摸选择选区与光标
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
- [x] Redo
- [x] Undo
- [x] Link
- [x] Image
- [ ] Codeblock
- [x] Heading
- [x] Table
- [x] Hr
- [x] Toolbar
- [x] Yjs
- [x] Serializes
- [x] ContextMenu
- [x] Clipboard
- [x] Drag

### [More](https://github.com/orgs/editablejs/projects/1/views/1)
