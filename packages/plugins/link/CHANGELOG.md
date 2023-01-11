# @editablejs/plugin-link

## 1.0.0-beta.8

### Patch Changes

- Updated dependencies [[`ba3b2cb`](https://github.com/editablejs/editable/commit/ba3b2cbe261a618a7bc21be14efe16c88100724a)]:
  - @editablejs/editor@1.0.0-beta.16

## 1.0.0-beta.7

### Patch Changes

- [`7cc05f1`](https://github.com/editablejs/editable/commit/7cc05f185659f56f77d9a7ad16fb78bf317d51fe) Thanks [@big-camel](https://github.com/big-camel)! - - Fix yjs and slate execution split-node, move-node, merge_node cannot update PointRef RangeRef PathRef related reference issues. Use @editablejs/plugin-yjs-websocket to pass meta additional messages
  - Improve metion plugin
- Updated dependencies [[`7cc05f1`](https://github.com/editablejs/editable/commit/7cc05f185659f56f77d9a7ad16fb78bf317d51fe), [`0d0ab13`](https://github.com/editablejs/editable/commit/0d0ab13f616aad6646b284eed2895fff27e2013a)]:
  - @editablejs/editor@1.0.0-beta.15
  - @editablejs/ui@1.0.0-beta.2

## 1.0.0-beta.6

### Patch Changes

- Updated dependencies [[`6f627f3`](https://github.com/editablejs/editable/commit/6f627f3646694cc3399ce7466eb17818ea20d2e3)]:
  - @editablejs/ui@1.0.0-beta.1

## 1.0.0-beta.5

### Minor Changes

- [`c250e92`](https://github.com/editablejs/editable/commit/c250e92d89d1e86885cc8e498c465396fb47fc66) Thanks [@big-camel](https://github.com/big-camel)! - refactor ui

### Patch Changes

- Updated dependencies [[`c250e92`](https://github.com/editablejs/editable/commit/c250e92d89d1e86885cc8e498c465396fb47fc66)]:
  - @editablejs/editor@1.0.0-beta.14

## 1.0.0-beta.4

### Patch Changes

- Updated dependencies [[`f3279c7`](https://github.com/editablejs/editable/commit/f3279c7f96acdcdca92684a4ebf885eb05e7aac5)]:
  - @editablejs/plugin-ui@1.0.0-beta.14

## 1.0.0-beta.3

### Patch Changes

- Updated dependencies [[`1bca53d`](https://github.com/editablejs/editable/commit/1bca53d995a2c6166481e33b858ec09217b3d7f7), [`1bca53d`](https://github.com/editablejs/editable/commit/1bca53d995a2c6166481e33b858ec09217b3d7f7)]:
  - @editablejs/plugin-ui@1.0.0-beta.13

## 1.0.0-beta.2

### Patch Changes

- Updated dependencies [[`4fcf386`](https://github.com/editablejs/editable/commit/4fcf3868109e5352ee6ee947ef12e6fe6dc27556)]:
  - @editablejs/plugin-ui@1.0.0-beta.12

## 1.0.0-beta.1

### Patch Changes

- [`f04726e`](https://github.com/editablejs/editable/commit/f04726eb0889c30f0ec4bd3482ef132cfdb679e6) Thanks [@big-camel](https://github.com/big-camel)! - - Add picture plugin
  - The history plugin adds `captureHistory` which can be used to filter operations that do not need to be stored in the history stack
  - Fixed an error in restoring the cursor after dragging
  - `editor.pasteText` -> `editor.insertTextFromClipboard`
  - `editor.paste` -> `editor.insertFromClipboard`
  - Add `editor.insertFile` api
  - Fixed `selection` drawing related to void nodes
- Updated dependencies [[`f04726e`](https://github.com/editablejs/editable/commit/f04726eb0889c30f0ec4bd3482ef132cfdb679e6)]:
  - @editablejs/editor@1.0.0-beta.13
  - @editablejs/plugin-ui@1.0.0-beta.11

## 1.0.0-beta.0

### Major Changes

- [`74fb9df`](https://github.com/editablejs/editable/commit/74fb9dfc9d7c3cf959604302e204f99070d64ef6) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - upgrad link

### Patch Changes

- [#34](https://github.com/editablejs/editable/pull/34) [`d7a7387`](https://github.com/editablejs/editable/commit/d7a7387c23f740cecb38177df2878bb6f2e6ec1d) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - add link plugin

* [#34](https://github.com/editablejs/editable/pull/34) [`885101f`](https://github.com/editablejs/editable/commit/885101f1a8d02ac388eb02bba884479f224a53ff) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - update ui

* Updated dependencies [[`d7a7387`](https://github.com/editablejs/editable/commit/d7a7387c23f740cecb38177df2878bb6f2e6ec1d), [`885101f`](https://github.com/editablejs/editable/commit/885101f1a8d02ac388eb02bba884479f224a53ff)]:
  - @editablejs/editor@1.0.0-beta.12
  - @editablejs/plugin-ui@1.0.0-beta.10
