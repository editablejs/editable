# @editablejs/plugin-yjs

## 1.0.0-beta.22

### Patch Changes

- [`34d0901`](https://github.com/editablejs/editable/commit/34d0901800730a5c5da9773eb8aa6d6c3f3829ad) Thanks [@big-camel](https://github.com/big-camel)! - useProviderProtocol -> withProviderProtocol

- Updated dependencies [[`34d0901`](https://github.com/editablejs/editable/commit/34d0901800730a5c5da9773eb8aa6d6c3f3829ad)]:
  - @editablejs/protocols@1.0.0-beta.4

## 1.0.0-beta.21

### Patch Changes

- Updated dependencies [[`1c1dc88`](https://github.com/editablejs/editable/commit/1c1dc880caf1b096da96c79cfcb0f654033f7d25)]:
  - @editablejs/editor@1.0.0-beta.19
  - @editablejs/protocols@1.0.0-beta.3
  - @editablejs/plugin-yjs-transform@1.0.0-beta.7

## 1.0.0-beta.20

### Patch Changes

- [`94cbf51`](https://github.com/editablejs/editable/commit/94cbf5117612174c0ecb2b536ac6695d1bfcf360) Thanks [@big-camel](https://github.com/big-camel)! - fix deps

- Updated dependencies [[`94cbf51`](https://github.com/editablejs/editable/commit/94cbf5117612174c0ecb2b536ac6695d1bfcf360)]:
  - @editablejs/editor@1.0.0-beta.18
  - @editablejs/protocols@1.0.0-beta.2
  - @editablejs/plugin-yjs-transform@1.0.0-beta.6
  - @editablejs/yjs-protocols@1.0.0-beta.2

## 1.0.0-beta.19

### Patch Changes

- [`cce1f0a`](https://github.com/editablejs/editable/commit/cce1f0a8fffb12e2adc7d65aa7960ed99236c5ed) Thanks [@big-camel](https://github.com/big-camel)! - reactor all

* [`63fb6ec`](https://github.com/editablejs/editable/commit/63fb6ec7ad7818a275f7b64c4ec09d4934dfd533) Thanks [@big-camel](https://github.com/big-camel)! - impl codeblock yjs

- [`a0abda0`](https://github.com/editablejs/editable/commit/a0abda0f26863b33d9c5c9eb982f5c638d3b658f) Thanks [@big-camel](https://github.com/big-camel)! - move plugin-yjs-protocols to yjs-protocols

- Updated dependencies [[`cce1f0a`](https://github.com/editablejs/editable/commit/cce1f0a8fffb12e2adc7d65aa7960ed99236c5ed), [`63fb6ec`](https://github.com/editablejs/editable/commit/63fb6ec7ad7818a275f7b64c4ec09d4934dfd533), [`a0abda0`](https://github.com/editablejs/editable/commit/a0abda0f26863b33d9c5c9eb982f5c638d3b658f)]:
  - @editablejs/editor@1.0.0-beta.17
  - @editablejs/plugin-yjs-transform@1.0.0-beta.5
  - @editablejs/yjs-protocols@1.0.0-beta.1
  - @editablejs/protocols@1.0.0-beta.1

## 1.0.0-beta.18

### Patch Changes

- [`ba3b2cb`](https://github.com/editablejs/editable/commit/ba3b2cbe261a618a7bc21be14efe16c88100724a) Thanks [@big-camel](https://github.com/big-camel)! - fix touch bug & refactor mention

- Updated dependencies [[`ba3b2cb`](https://github.com/editablejs/editable/commit/ba3b2cbe261a618a7bc21be14efe16c88100724a)]:
  - @editablejs/editor@1.0.0-beta.16

## 1.0.0-beta.17

### Patch Changes

- [`7cc05f1`](https://github.com/editablejs/editable/commit/7cc05f185659f56f77d9a7ad16fb78bf317d51fe) Thanks [@big-camel](https://github.com/big-camel)! - - Fix yjs and slate execution split-node, move-node, merge_node cannot update PointRef RangeRef PathRef related reference issues. Use @editablejs/plugin-yjs-websocket to pass meta additional messages
  - Improve metion plugin
- Updated dependencies [[`7cc05f1`](https://github.com/editablejs/editable/commit/7cc05f185659f56f77d9a7ad16fb78bf317d51fe), [`0d0ab13`](https://github.com/editablejs/editable/commit/0d0ab13f616aad6646b284eed2895fff27e2013a)]:
  - @editablejs/editor@1.0.0-beta.15
  - @editablejs/plugin-yjs-transform@1.0.0-beta.4

## 1.0.0-beta.16

### Minor Changes

- [`c250e92`](https://github.com/editablejs/editable/commit/c250e92d89d1e86885cc8e498c465396fb47fc66) Thanks [@big-camel](https://github.com/big-camel)! - refactor ui

### Patch Changes

- Updated dependencies [[`c250e92`](https://github.com/editablejs/editable/commit/c250e92d89d1e86885cc8e498c465396fb47fc66)]:
  - @editablejs/editor@1.0.0-beta.14

## 1.0.0-beta.15

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
  - @editablejs/plugin-yjs-transform@1.0.0-beta.3

## 1.0.0-beta.14

### Patch Changes

- Updated dependencies [[`d7a7387`](https://github.com/editablejs/editable/commit/d7a7387c23f740cecb38177df2878bb6f2e6ec1d), [`885101f`](https://github.com/editablejs/editable/commit/885101f1a8d02ac388eb02bba884479f224a53ff)]:
  - @editablejs/editor@1.0.0-beta.12

## 1.0.0-beta.13

### Patch Changes

- Updated dependencies [[`a0a603c`](https://github.com/editablejs/editable/commit/a0a603cd3e56663c73ad338d369692f5ad375aef)]:
  - @editablejs/editor@1.0.0-beta.11

## 1.0.0-beta.12

### Patch Changes

- Updated dependencies [[`2fb4f42`](https://github.com/editablejs/editable/commit/2fb4f42227b5505fa9adfe5a7548750cd479944b)]:
  - @editablejs/editor@1.0.0-beta.10

## 1.0.0-beta.11

### Patch Changes

- [`d9143b2`](https://github.com/editablejs/editable/commit/d9143b29b6c0c23d79641e61be64d4e164c58465) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - re ci

- Updated dependencies [[`d9143b2`](https://github.com/editablejs/editable/commit/d9143b29b6c0c23d79641e61be64d4e164c58465)]:
  - @editablejs/editor@1.0.0-beta.9
  - @editablejs/plugin-yjs-transform@1.0.0-beta.2

## 1.0.0-beta.10

### Patch Changes

- Updated dependencies [[`2393373`](https://github.com/editablejs/editable/commit/2393373aa133d947509c721302d85834509054d8)]:
  - @editablejs/editor@1.0.0-beta.8

## 1.0.0-beta.9

### Patch Changes

- Updated dependencies [[`824c85f`](https://github.com/editablejs/editable/commit/824c85f60a7e353c0bec69574ff8acd54df3b9a6)]:
  - @editablejs/editor@1.0.0-beta.7

## 1.0.0-beta.8

### Patch Changes

- Updated dependencies [[`7923293`](https://github.com/editablejs/editable/commit/79232932d34772aa75648b3df161f08dca1130a6)]:
  - @editablejs/editor@1.0.0-beta.6

## 1.0.0-beta.7

### Patch Changes

- Updated dependencies [[`a13a6e2`](https://github.com/editablejs/editable/commit/a13a6e2ed8796ed5076e921358d2ce6505cce392)]:
  - @editablejs/plugin-yjs-transform@1.0.0-beta.1

## 1.0.0-beta.6

### Patch Changes

- [`5ac5c2e`](https://github.com/editablejs/editable/commit/5ac5c2e5b4a879dc52c38d95712692f05a21ab78) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - split plugin-yjs package

- Updated dependencies [[`5ac5c2e`](https://github.com/editablejs/editable/commit/5ac5c2e5b4a879dc52c38d95712692f05a21ab78)]:
  - @editablejs/editor@1.0.0-beta.5
  - @editablejs/plugin-yjs-transform@0.0.1-beta.0

## 1.0.0-beta.5

### Patch Changes

- [`c12edb9`](https://github.com/editablejs/editable/commit/c12edb9cd97d1958b1d5930fda5d1be4511d8da4) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - init value in yjs server connected

## 1.0.0-beta.4

### Patch Changes

- [`d9250e0`](https://github.com/editablejs/editable/commit/d9250e0ec00951cd2246813ac13c5e1fa2a7faeb) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - Fix undo/redo error

- Updated dependencies [[`d9250e0`](https://github.com/editablejs/editable/commit/d9250e0ec00951cd2246813ac13c5e1fa2a7faeb)]:
  - @editablejs/editor@1.0.0-beta.4

## 1.0.0-beta.3

### Patch Changes

- [`4898015`](https://github.com/editablejs/editable/commit/489801580e1679b098f898625a9b28e7ec112332) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - add touch select

- Updated dependencies [[`4898015`](https://github.com/editablejs/editable/commit/489801580e1679b098f898625a9b28e7ec112332)]:
  - @editablejs/editor@1.0.0-beta.3

## 1.0.0-beta.2

### Patch Changes

- [`0a02885`](https://github.com/editablejs/editable/commit/0a028851cee60fe7ff97a9b109138b3f5fba2db7) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - exports esm cjs

- Updated dependencies [[`0a02885`](https://github.com/editablejs/editable/commit/0a028851cee60fe7ff97a9b109138b3f5fba2db7)]:
  - @editablejs/editor@1.0.0-beta.2

## 1.0.0-beta.1

### Patch Changes

- [`fdafeac`](https://github.com/editablejs/editable/commit/fdafeacb8da94a19fd5b74dab621add727b8d1fd) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - add exports to package.json

- Updated dependencies [[`fdafeac`](https://github.com/editablejs/editable/commit/fdafeacb8da94a19fd5b74dab621add727b8d1fd)]:
  - @editablejs/editor@1.0.0-beta.1

## 1.0.0-beta.0

### Major Changes

- [`015a4c7`](https://github.com/editablejs/editable/commit/015a4c788896d238bb67b09d117675a442e28903) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - publish

### Minor Changes

- [#13](https://github.com/editablejs/editable/pull/13) [`1e720a4`](https://github.com/editablejs/editable/commit/1e720a42cdffe82a5003df522c8021f431ba6674) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - first publish

### Patch Changes

- Updated dependencies [[`1e720a4`](https://github.com/editablejs/editable/commit/1e720a42cdffe82a5003df522c8021f431ba6674), [`015a4c7`](https://github.com/editablejs/editable/commit/015a4c788896d238bb67b09d117675a442e28903)]:
  - @editablejs/editor@1.0.0-beta.0
