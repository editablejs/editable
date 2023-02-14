[![zh-CN](https://img.shields.io/badge/lang-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-red.svg?longCache=true&style=flat-square 'zh-CN')](README.zh-CN.md)

# Editable

`Editable` is an extensible rich text editor framework that focuses on stability, controllability, and performance. To achieve this, we did not use the native editable attribute [~~contenteditable~~](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable), but instead used a custom renderer that allows us to better control the editor's behavior. From now on, you no longer have to worry about cross-platform and browser compatibility issues (such as `Selection`, `Input`), just focus on your business logic.

Currently, it is still in beta version and the API may undergo significant changes, so related documents are not yet complete.

You can see a demo here: https://docs.editablejs.com/playground

---

- Why not use `canvas` rendering?

  Although `canvas` rendering may be faster than DOM rendering in terms of performance, the development experience of `canvas` is not good and requires writing more code.

- Why use `React` for rendering?

  `React` makes plugins more flexible and has a good ecosystem. However, React's performance is not as good as native DOM.

  In my ideal frontend framework for rich text, it should be like this:

  1. No virtual DOM
  2. No diff algorithm
  3. No proxy object

  Therefore, I compared frontend frameworks such as `Vue`, `Solid-js`, and `SvelteJS` and found that `Solid-js` meets the first two criteria, but each property is wrapped in a `proxy`, which may cause problems when comparing with pure JS objects using `===` during extension development.

  To improve performance, we are likely to refactor it for native DOM rendering in future development.

Currently, React meets the following two standards:

- [x] Development experience
- [x] Plugin extensibility
- [ ] Cross-frontend compatibility
- [ ] Rendering performance

In the subsequent refactoring selection, we will try to balance these four standards as much as possible.

## Development

```bash
# install
pnpm install

# build
pnpm build

# start up
pnpm dev

```

## TODO

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
- [x] Touch to select selection and cursor
- [ ] Full coverage of unit tests

### Input

- [x] combined input method input
- [x] paste
- [x] paste as plain text
- [x] copy
- [x] cut

### Drag

- [x] drag and drop selection text
- [x] drag and drop files
- [x] drag node

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
- [x] Clipboard
- [x] Drag
- [x] Leading
- [x] Align
- [x] Mention

### [More](https://github.com/orgs/editablejs/projects/1/views/1)
