# @editablejs/plugin-heading

## 1.0.2

### Patch Changes

- Updated dependencies [[`54c338e`](https://github.com/editablejs/editable/commit/54c338e43352304c3a41879f57c4ebc87f48c921)]:
  - @editablejs/serializer@1.0.1
  - @editablejs/editor@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [[`fe6f337`](https://github.com/editablejs/editable/commit/fe6f337edf559f63bc78217c969e61e6b5fb63cf)]:
  - @editablejs/editor@1.0.1

## 1.0.0

### Major Changes

- [`015a4c7`](https://github.com/editablejs/editable/commit/015a4c788896d238bb67b09d117675a442e28903) Thanks [@big-camel](https://github.com/big-camel)! - publish

* [`559afa8`](https://github.com/editablejs/editable/commit/559afa882d9e7f8d6929fa5d74eb1a6fb54a6f39) Thanks [@big-camel](https://github.com/big-camel)! - refactor all

### Minor Changes

- [#13](https://github.com/editablejs/editable/pull/13) [`1e720a4`](https://github.com/editablejs/editable/commit/1e720a42cdffe82a5003df522c8021f431ba6674) Thanks [@big-camel](https://github.com/big-camel)! - first publish

* [`c250e92`](https://github.com/editablejs/editable/commit/c250e92d89d1e86885cc8e498c465396fb47fc66) Thanks [@big-camel](https://github.com/big-camel)! - refactor ui

### Patch Changes

- [`4898015`](https://github.com/editablejs/editable/commit/489801580e1679b098f898625a9b28e7ec112332) Thanks [@big-camel](https://github.com/big-camel)! - add touch select

* [`94cbf51`](https://github.com/editablejs/editable/commit/94cbf5117612174c0ecb2b536ac6695d1bfcf360) Thanks [@big-camel](https://github.com/big-camel)! - fix deps

- [`0daab81`](https://github.com/editablejs/editable/commit/0daab812f79401a7cc4c1f20c92717666c6eade4) Thanks [@big-camel](https://github.com/big-camel)! - Refactor list node style update.

* [`f04726e`](https://github.com/editablejs/editable/commit/f04726eb0889c30f0ec4bd3482ef132cfdb679e6) Thanks [@big-camel](https://github.com/big-camel)! - - Add picture plugin
  - The history plugin adds `captureHistory` which can be used to filter operations that do not need to be stored in the history stack
  - Fixed an error in restoring the cursor after dragging
  - `editor.pasteText` -> `editor.insertTextFromClipboard`
  - `editor.paste` -> `editor.insertFromClipboard`
  - Add `editor.insertFile` api
  - Fixed `selection` drawing related to void nodes

- [`5ac5c2e`](https://github.com/editablejs/editable/commit/5ac5c2e5b4a879dc52c38d95712692f05a21ab78) Thanks [@big-camel](https://github.com/big-camel)! - split plugin-yjs package

* [`d9143b2`](https://github.com/editablejs/editable/commit/d9143b29b6c0c23d79641e61be64d4e164c58465) Thanks [@big-camel](https://github.com/big-camel)! - re ci

- [`fdafeac`](https://github.com/editablejs/editable/commit/fdafeacb8da94a19fd5b74dab621add727b8d1fd) Thanks [@big-camel](https://github.com/big-camel)! - add exports to package.json

* [`3855f3f`](https://github.com/editablejs/editable/commit/3855f3fdef0869e2057f18b18d2fd2b903ff4287) Thanks [@big-camel](https://github.com/big-camel)! - Add markdown paste demo

- [`7cc05f1`](https://github.com/editablejs/editable/commit/7cc05f185659f56f77d9a7ad16fb78bf317d51fe) Thanks [@big-camel](https://github.com/big-camel)! - - Fix yjs and slate execution split-node, move-node, merge_node cannot update PointRef RangeRef PathRef related reference issues. Use @editablejs/plugin-yjs-websocket to pass meta additional messages
  - Improve metion plugin

* [`cce1f0a`](https://github.com/editablejs/editable/commit/cce1f0a8fffb12e2adc7d65aa7960ed99236c5ed) Thanks [@big-camel](https://github.com/big-camel)! - reactor all

- [`0a02885`](https://github.com/editablejs/editable/commit/0a028851cee60fe7ff97a9b109138b3f5fba2db7) Thanks [@big-camel](https://github.com/big-camel)! - exports esm cjs

* [`f983a67`](https://github.com/editablejs/editable/commit/f983a679c4ed20dfc71bcb9e815369a6d8cd6811) Thanks [@big-camel](https://github.com/big-camel)! - Continuing to add markdown shortcuts to the plugin.

* Updated dependencies [[`8af07db`](https://github.com/editablejs/editable/commit/8af07db76b21ecd191e356aed10badc196179152), [`4898015`](https://github.com/editablejs/editable/commit/489801580e1679b098f898625a9b28e7ec112332), [`94cbf51`](https://github.com/editablejs/editable/commit/94cbf5117612174c0ecb2b536ac6695d1bfcf360), [`0daab81`](https://github.com/editablejs/editable/commit/0daab812f79401a7cc4c1f20c92717666c6eade4), [`824c85f`](https://github.com/editablejs/editable/commit/824c85f60a7e353c0bec69574ff8acd54df3b9a6), [`1e720a4`](https://github.com/editablejs/editable/commit/1e720a42cdffe82a5003df522c8021f431ba6674), [`1c1dc88`](https://github.com/editablejs/editable/commit/1c1dc880caf1b096da96c79cfcb0f654033f7d25), [`f04726e`](https://github.com/editablejs/editable/commit/f04726eb0889c30f0ec4bd3482ef132cfdb679e6), [`ea51ee7`](https://github.com/editablejs/editable/commit/ea51ee7c873f7272076a53b35e085aec1a2865ce), [`7350f1b`](https://github.com/editablejs/editable/commit/7350f1b0bbd33a4f0815b11dcb765b4c2de1924e), [`88d673b`](https://github.com/editablejs/editable/commit/88d673b7313c7a9f95cb6814dbf95caf1d09dbd1), [`5ac5c2e`](https://github.com/editablejs/editable/commit/5ac5c2e5b4a879dc52c38d95712692f05a21ab78), [`d9143b2`](https://github.com/editablejs/editable/commit/d9143b29b6c0c23d79641e61be64d4e164c58465), [`2fb4f42`](https://github.com/editablejs/editable/commit/2fb4f42227b5505fa9adfe5a7548750cd479944b), [`fdafeac`](https://github.com/editablejs/editable/commit/fdafeacb8da94a19fd5b74dab621add727b8d1fd), [`af0a5ae`](https://github.com/editablejs/editable/commit/af0a5aed6e688e0fe69bea3349cef643b8321d16), [`3855f3f`](https://github.com/editablejs/editable/commit/3855f3fdef0869e2057f18b18d2fd2b903ff4287), [`015a4c7`](https://github.com/editablejs/editable/commit/015a4c788896d238bb67b09d117675a442e28903), [`2393373`](https://github.com/editablejs/editable/commit/2393373aa133d947509c721302d85834509054d8), [`5420964`](https://github.com/editablejs/editable/commit/5420964753edb470ae94572e5272980ea82ae3fd), [`c250e92`](https://github.com/editablejs/editable/commit/c250e92d89d1e86885cc8e498c465396fb47fc66), [`ba3b2cb`](https://github.com/editablejs/editable/commit/ba3b2cbe261a618a7bc21be14efe16c88100724a), [`a0a603c`](https://github.com/editablejs/editable/commit/a0a603cd3e56663c73ad338d369692f5ad375aef), [`7cc05f1`](https://github.com/editablejs/editable/commit/7cc05f185659f56f77d9a7ad16fb78bf317d51fe), [`66365e8`](https://github.com/editablejs/editable/commit/66365e8de879e66ab1717735c2e1ad410cfd2a85), [`a644a5a`](https://github.com/editablejs/editable/commit/a644a5aa29ac1b28f95b49225d049c73ecd4ead5), [`437dc00`](https://github.com/editablejs/editable/commit/437dc008d72a88d73160ce13e12dc334f7b33248), [`bcae219`](https://github.com/editablejs/editable/commit/bcae21983542dafdc17d852d7670a604d8a37b3b), [`ee09868`](https://github.com/editablejs/editable/commit/ee09868cd7b6a5791657fc1619a4cea9b19f1e44), [`559afa8`](https://github.com/editablejs/editable/commit/559afa882d9e7f8d6929fa5d74eb1a6fb54a6f39), [`cce1f0a`](https://github.com/editablejs/editable/commit/cce1f0a8fffb12e2adc7d65aa7960ed99236c5ed), [`5c15653`](https://github.com/editablejs/editable/commit/5c1565330e543b5f80e3baa5d6857cd63d0389f9), [`63fb6ec`](https://github.com/editablejs/editable/commit/63fb6ec7ad7818a275f7b64c4ec09d4934dfd533), [`1092b75`](https://github.com/editablejs/editable/commit/1092b7572695079b42a9afbe96c05e6451730501), [`d7a7387`](https://github.com/editablejs/editable/commit/d7a7387c23f740cecb38177df2878bb6f2e6ec1d), [`f97e47c`](https://github.com/editablejs/editable/commit/f97e47c08f3d0933478df7283d90b0da6832b391), [`d9250e0`](https://github.com/editablejs/editable/commit/d9250e0ec00951cd2246813ac13c5e1fa2a7faeb), [`7923293`](https://github.com/editablejs/editable/commit/79232932d34772aa75648b3df161f08dca1130a6), [`981e4ee`](https://github.com/editablejs/editable/commit/981e4eeb902ddf53135999fbab05a8e7bfb8778f), [`99325fd`](https://github.com/editablejs/editable/commit/99325fd2be94294ecd70ee069f3ba6cdff43219e), [`0a02885`](https://github.com/editablejs/editable/commit/0a028851cee60fe7ff97a9b109138b3f5fba2db7), [`0d0ab13`](https://github.com/editablejs/editable/commit/0d0ab13f616aad6646b284eed2895fff27e2013a), [`f983a67`](https://github.com/editablejs/editable/commit/f983a679c4ed20dfc71bcb9e815369a6d8cd6811), [`885101f`](https://github.com/editablejs/editable/commit/885101f1a8d02ac388eb02bba884479f224a53ff)]:
  - @editablejs/editor@1.0.0
  - @editablejs/models@1.0.0
  - @editablejs/deserializer@1.0.0
  - @editablejs/serializer@1.0.0

## 1.0.0-beta.29

### Patch Changes

- Updated dependencies [[`88d673b`](https://github.com/editablejs/editable/commit/88d673b7313c7a9f95cb6814dbf95caf1d09dbd1)]:
  - @editablejs/editor@1.0.0-beta.29

## 1.0.0-beta.28

### Patch Changes

- [`0daab81`](https://github.com/editablejs/editable/commit/0daab812f79401a7cc4c1f20c92717666c6eade4) Thanks [@big-camel](https://github.com/big-camel)! - Refactor list node style update.

- Updated dependencies [[`0daab81`](https://github.com/editablejs/editable/commit/0daab812f79401a7cc4c1f20c92717666c6eade4), [`f97e47c`](https://github.com/editablejs/editable/commit/f97e47c08f3d0933478df7283d90b0da6832b391)]:
  - @editablejs/editor@1.0.0-beta.28
  - @editablejs/models@1.0.0-beta.6
  - @editablejs/deserializer@1.0.0-beta.7
  - @editablejs/serializer@1.0.0-beta.6

## 1.0.0-beta.27

### Patch Changes

- Updated dependencies [[`981e4ee`](https://github.com/editablejs/editable/commit/981e4eeb902ddf53135999fbab05a8e7bfb8778f)]:
  - @editablejs/models@1.0.0-beta.5
  - @editablejs/deserializer@1.0.0-beta.6
  - @editablejs/editor@1.0.0-beta.27
  - @editablejs/serializer@1.0.0-beta.5

## 1.0.0-beta.26

### Patch Changes

- Updated dependencies [[`a644a5a`](https://github.com/editablejs/editable/commit/a644a5aa29ac1b28f95b49225d049c73ecd4ead5), [`5c15653`](https://github.com/editablejs/editable/commit/5c1565330e543b5f80e3baa5d6857cd63d0389f9)]:
  - @editablejs/editor@1.0.0-beta.26
  - @editablejs/models@1.0.0-beta.4
  - @editablejs/deserializer@1.0.0-beta.5
  - @editablejs/serializer@1.0.0-beta.4

## 1.0.0-beta.25

### Patch Changes

- Updated dependencies [[`ea51ee7`](https://github.com/editablejs/editable/commit/ea51ee7c873f7272076a53b35e085aec1a2865ce), [`7350f1b`](https://github.com/editablejs/editable/commit/7350f1b0bbd33a4f0815b11dcb765b4c2de1924e), [`5420964`](https://github.com/editablejs/editable/commit/5420964753edb470ae94572e5272980ea82ae3fd)]:
  - @editablejs/editor@1.0.0-beta.25
  - @editablejs/models@1.0.0-beta.3
  - @editablejs/deserializer@1.0.0-beta.4
  - @editablejs/serializer@1.0.0-beta.3

## 1.0.0-beta.24

### Patch Changes

- Updated dependencies [[`66365e8`](https://github.com/editablejs/editable/commit/66365e8de879e66ab1717735c2e1ad410cfd2a85), [`bcae219`](https://github.com/editablejs/editable/commit/bcae21983542dafdc17d852d7670a604d8a37b3b), [`ee09868`](https://github.com/editablejs/editable/commit/ee09868cd7b6a5791657fc1619a4cea9b19f1e44), [`1092b75`](https://github.com/editablejs/editable/commit/1092b7572695079b42a9afbe96c05e6451730501)]:
  - @editablejs/editor@1.0.0-beta.24

## 1.0.0-beta.23

### Patch Changes

- Updated dependencies [[`af0a5ae`](https://github.com/editablejs/editable/commit/af0a5aed6e688e0fe69bea3349cef643b8321d16)]:
  - @editablejs/editor@1.0.0-beta.23

## 1.0.0-beta.22

### Patch Changes

- [`3855f3f`](https://github.com/editablejs/editable/commit/3855f3fdef0869e2057f18b18d2fd2b903ff4287) Thanks [@big-camel](https://github.com/big-camel)! - Add markdown paste demo

- Updated dependencies [[`3855f3f`](https://github.com/editablejs/editable/commit/3855f3fdef0869e2057f18b18d2fd2b903ff4287)]:
  - @editablejs/deserializer@1.0.0-beta.3
  - @editablejs/editor@1.0.0-beta.22

## 1.0.0-beta.21

### Patch Changes

- [`f983a67`](https://github.com/editablejs/editable/commit/f983a679c4ed20dfc71bcb9e815369a6d8cd6811) Thanks [@big-camel](https://github.com/big-camel)! - Continuing to add markdown shortcuts to the plugin.

- Updated dependencies [[`437dc00`](https://github.com/editablejs/editable/commit/437dc008d72a88d73160ce13e12dc334f7b33248), [`99325fd`](https://github.com/editablejs/editable/commit/99325fd2be94294ecd70ee069f3ba6cdff43219e), [`f983a67`](https://github.com/editablejs/editable/commit/f983a679c4ed20dfc71bcb9e815369a6d8cd6811)]:
  - @editablejs/editor@1.0.0-beta.21
  - @editablejs/models@1.0.0-beta.2
  - @editablejs/deserializer@1.0.0-beta.2
  - @editablejs/serializer@1.0.0-beta.2

## 1.0.0-beta.20

### Major Changes

- [`559afa8`](https://github.com/editablejs/editable/commit/559afa882d9e7f8d6929fa5d74eb1a6fb54a6f39) Thanks [@big-camel](https://github.com/big-camel)! - refactor all

### Patch Changes

- Updated dependencies [[`8af07db`](https://github.com/editablejs/editable/commit/8af07db76b21ecd191e356aed10badc196179152), [`559afa8`](https://github.com/editablejs/editable/commit/559afa882d9e7f8d6929fa5d74eb1a6fb54a6f39)]:
  - @editablejs/editor@1.0.0-beta.20
  - @editablejs/deserializer@1.0.0-beta.1
  - @editablejs/models@1.0.0-beta.1
  - @editablejs/serializer@1.0.0-beta.1

## 1.0.0-beta.19

### Patch Changes

- Updated dependencies [[`1c1dc88`](https://github.com/editablejs/editable/commit/1c1dc880caf1b096da96c79cfcb0f654033f7d25)]:
  - @editablejs/editor@1.0.0-beta.19

## 1.0.0-beta.18

### Patch Changes

- [`94cbf51`](https://github.com/editablejs/editable/commit/94cbf5117612174c0ecb2b536ac6695d1bfcf360) Thanks [@big-camel](https://github.com/big-camel)! - fix deps

- Updated dependencies [[`94cbf51`](https://github.com/editablejs/editable/commit/94cbf5117612174c0ecb2b536ac6695d1bfcf360)]:
  - @editablejs/editor@1.0.0-beta.18

## 1.0.0-beta.17

### Patch Changes

- [`cce1f0a`](https://github.com/editablejs/editable/commit/cce1f0a8fffb12e2adc7d65aa7960ed99236c5ed) Thanks [@big-camel](https://github.com/big-camel)! - reactor all

- Updated dependencies [[`cce1f0a`](https://github.com/editablejs/editable/commit/cce1f0a8fffb12e2adc7d65aa7960ed99236c5ed), [`63fb6ec`](https://github.com/editablejs/editable/commit/63fb6ec7ad7818a275f7b64c4ec09d4934dfd533)]:
  - @editablejs/editor@1.0.0-beta.17

## 1.0.0-beta.16

### Patch Changes

- Updated dependencies [[`ba3b2cb`](https://github.com/editablejs/editable/commit/ba3b2cbe261a618a7bc21be14efe16c88100724a)]:
  - @editablejs/editor@1.0.0-beta.16

## 1.0.0-beta.15

### Patch Changes

- [`7cc05f1`](https://github.com/editablejs/editable/commit/7cc05f185659f56f77d9a7ad16fb78bf317d51fe) Thanks [@big-camel](https://github.com/big-camel)! - - Fix yjs and slate execution split-node, move-node, merge_node cannot update PointRef RangeRef PathRef related reference issues. Use @editablejs/plugin-yjs-websocket to pass meta additional messages
  - Improve metion plugin
- Updated dependencies [[`7cc05f1`](https://github.com/editablejs/editable/commit/7cc05f185659f56f77d9a7ad16fb78bf317d51fe), [`0d0ab13`](https://github.com/editablejs/editable/commit/0d0ab13f616aad6646b284eed2895fff27e2013a)]:
  - @editablejs/editor@1.0.0-beta.15

## 1.0.0-beta.14

### Minor Changes

- [`c250e92`](https://github.com/editablejs/editable/commit/c250e92d89d1e86885cc8e498c465396fb47fc66) Thanks [@big-camel](https://github.com/big-camel)! - refactor ui

### Patch Changes

- Updated dependencies [[`c250e92`](https://github.com/editablejs/editable/commit/c250e92d89d1e86885cc8e498c465396fb47fc66)]:
  - @editablejs/editor@1.0.0-beta.14

## 1.0.0-beta.13

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

## 1.0.0-beta.12

### Patch Changes

- Updated dependencies [[`d7a7387`](https://github.com/editablejs/editable/commit/d7a7387c23f740cecb38177df2878bb6f2e6ec1d), [`885101f`](https://github.com/editablejs/editable/commit/885101f1a8d02ac388eb02bba884479f224a53ff)]:
  - @editablejs/editor@1.0.0-beta.12

## 1.0.0-beta.11

### Patch Changes

- Updated dependencies [[`a0a603c`](https://github.com/editablejs/editable/commit/a0a603cd3e56663c73ad338d369692f5ad375aef)]:
  - @editablejs/editor@1.0.0-beta.11

## 1.0.0-beta.10

### Patch Changes

- Updated dependencies [[`2fb4f42`](https://github.com/editablejs/editable/commit/2fb4f42227b5505fa9adfe5a7548750cd479944b)]:
  - @editablejs/editor@1.0.0-beta.10

## 1.0.0-beta.9

### Patch Changes

- [`d9143b2`](https://github.com/editablejs/editable/commit/d9143b29b6c0c23d79641e61be64d4e164c58465) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - re ci

- Updated dependencies [[`d9143b2`](https://github.com/editablejs/editable/commit/d9143b29b6c0c23d79641e61be64d4e164c58465)]:
  - @editablejs/editor@1.0.0-beta.9

## 1.0.0-beta.8

### Patch Changes

- Updated dependencies [[`2393373`](https://github.com/editablejs/editable/commit/2393373aa133d947509c721302d85834509054d8)]:
  - @editablejs/editor@1.0.0-beta.8

## 1.0.0-beta.7

### Patch Changes

- Updated dependencies [[`824c85f`](https://github.com/editablejs/editable/commit/824c85f60a7e353c0bec69574ff8acd54df3b9a6)]:
  - @editablejs/editor@1.0.0-beta.7

## 1.0.0-beta.6

### Patch Changes

- Updated dependencies [[`7923293`](https://github.com/editablejs/editable/commit/79232932d34772aa75648b3df161f08dca1130a6)]:
  - @editablejs/editor@1.0.0-beta.6

## 1.0.0-beta.5

### Patch Changes

- [`5ac5c2e`](https://github.com/editablejs/editable/commit/5ac5c2e5b4a879dc52c38d95712692f05a21ab78) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - split plugin-yjs package

- Updated dependencies [[`5ac5c2e`](https://github.com/editablejs/editable/commit/5ac5c2e5b4a879dc52c38d95712692f05a21ab78)]:
  - @editablejs/editor@1.0.0-beta.5

## 1.0.0-beta.4

### Patch Changes

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
