[![zh-CN](https://img.shields.io/badge/lang-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-red.svg?longCache=true&style=flat-square "zh-CN")](README.zh-CN.md)

# Editable

An experimental rich text editor framework which aims to replace the native `contenteditable` attribute with a self-drawn cursor to provide richer and more stable editing capabilities.

## Development

Use `nextjs` & `turbo` to build a development environment, use `typescript` for development, and use jest for unit testing.

```bash
# Install
pnpm install

# start up
pnpm dev

```

## Directory Structure

All source codes are in packages, and the apps directory is mainly used for documentation and test cases. Now, in the initial development phase, a React rendering editor model and the logic of model update are written for visual testing.

### packages/editable-breaker

Mainly index some `unicode` characters. Because the number of bytes occupied by some characters is uncertain, resulting in inaccurate indexes after some characters are split, so this toolkit is needed to solve this problem.

### packages/editable-react

Use the slatejs data model, and use react to render in the self-drawn cursor mode, no longer relying on the contenteditable attribute

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
- [ ] touch to select selection and cursor
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
- [ ] Fontsize
- [ ] Fontcolor
- [ ] BackgroundColor
- [ ] Redo
- [ ] Undo
- [ ] Link
- [ ] Image
- [ ] Codeblock
- [ ] Heading
- [ ] Table
- [ ] Hr
- [ ] Toolbar