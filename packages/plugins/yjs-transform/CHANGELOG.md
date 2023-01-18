# @editablejs/plugin-yjs-transform

## 1.0.0-beta.6

### Patch Changes

- [`94cbf51`](https://github.com/editablejs/editable/commit/94cbf5117612174c0ecb2b536ac6695d1bfcf360) Thanks [@big-camel](https://github.com/big-camel)! - fix deps

- Updated dependencies [[`94cbf51`](https://github.com/editablejs/editable/commit/94cbf5117612174c0ecb2b536ac6695d1bfcf360)]:
  - @editablejs/editor@1.0.0-beta.18

## 1.0.0-beta.5

### Patch Changes

- [`cce1f0a`](https://github.com/editablejs/editable/commit/cce1f0a8fffb12e2adc7d65aa7960ed99236c5ed) Thanks [@big-camel](https://github.com/big-camel)! - reactor all

* [`63fb6ec`](https://github.com/editablejs/editable/commit/63fb6ec7ad7818a275f7b64c4ec09d4934dfd533) Thanks [@big-camel](https://github.com/big-camel)! - impl codeblock yjs

* Updated dependencies [[`cce1f0a`](https://github.com/editablejs/editable/commit/cce1f0a8fffb12e2adc7d65aa7960ed99236c5ed), [`63fb6ec`](https://github.com/editablejs/editable/commit/63fb6ec7ad7818a275f7b64c4ec09d4934dfd533)]:
  - @editablejs/editor@1.0.0-beta.17

## 1.0.0-beta.4

### Patch Changes

- [`7cc05f1`](https://github.com/editablejs/editable/commit/7cc05f185659f56f77d9a7ad16fb78bf317d51fe) Thanks [@big-camel](https://github.com/big-camel)! - - Fix yjs and slate execution split-node, move-node, merge_node cannot update PointRef RangeRef PathRef related reference issues. Use @editablejs/plugin-yjs-websocket to pass meta additional messages
  - Improve metion plugin

## 1.0.0-beta.3

### Patch Changes

- [`f04726e`](https://github.com/editablejs/editable/commit/f04726eb0889c30f0ec4bd3482ef132cfdb679e6) Thanks [@big-camel](https://github.com/big-camel)! - - Add picture plugin
  - The history plugin adds `captureHistory` which can be used to filter operations that do not need to be stored in the history stack
  - Fixed an error in restoring the cursor after dragging
  - `editor.pasteText` -> `editor.insertTextFromClipboard`
  - `editor.paste` -> `editor.insertFromClipboard`
  - Add `editor.insertFile` api
  - Fixed `selection` drawing related to void nodes

## 1.0.0-beta.2

### Patch Changes

- [`d9143b2`](https://github.com/editablejs/editable/commit/d9143b29b6c0c23d79641e61be64d4e164c58465) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - re ci

## 1.0.0-beta.1

### Major Changes

- [`a13a6e2`](https://github.com/editablejs/editable/commit/a13a6e2ed8796ed5076e921358d2ce6505cce392) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - set yjs-transform to 1.0.0.beta

## 0.0.1-beta.0

### Patch Changes

- [`5ac5c2e`](https://github.com/editablejs/editable/commit/5ac5c2e5b4a879dc52c38d95712692f05a21ab78) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - split plugin-yjs package
