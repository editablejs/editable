[![zh-CN](https://img.shields.io/badge/lang-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-red.svg?longCache=true&style=flat-square 'zh-CN')](README.zh-CN.md)

# Editable

An experimental rich text editor framework which aims to replace the native `contenteditable` attribute with a self-drawn cursor to provide richer and more stable editing capabilities.

## Development

```bash
# Install
pnpm install

# start up
pnpm dev

```
### packages/editor

Use the slatejs data model, and use react to render in the self-drawn cursor mode, no longer relying on the contenteditable attribute

### packages/plugins

plugin directory

## Task

### Selection

- [x] English keyboard input
- [x] combined input method input
- [x] cursor selection rendering
- [x] text input box rendering
- [x] Drag mouse to select selection and cursor
- [x] Switch cursor and selection by keyboard left and right keys
- [x] Switch cursor and selection by keyboard Shift+left and right keys
- [x] Switch cursor and selection by keyboard Shift + Up and Down keys
- [x] Switch cursor and selection by keyboard Ctrl+up and down keys
- [x] Switch cursor and selection by keyboard up and down keys
- [x] Double-click and triple-click to select text after word segmentation
- [x] touch to select selection and cursor
- [ ] Full coverage of unit tests

### Input

- [x] combined input method input

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
- [ ] Hr
- [x] Toolbar
- [x] Yjs
- [x] Serializes
- [x] ContextMenu
- [x] Clipboard
- [x] Drag

### [More](https://github.com/orgs/editablejs/projects/1/views/1)
