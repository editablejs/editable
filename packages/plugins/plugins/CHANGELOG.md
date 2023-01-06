# @editablejs/plugins

## 1.0.0-beta.23

### Patch Changes

- [`6f627f3`](https://github.com/editablejs/editable/commit/6f627f3646694cc3399ce7466eb17818ea20d2e3) Thanks [@big-camel](https://github.com/big-camel)! - add font-color & background-color plugin

- Updated dependencies [[`6f627f3`](https://github.com/editablejs/editable/commit/6f627f3646694cc3399ce7466eb17818ea20d2e3)]:
  - @editablejs/plugin-align@1.0.0-beta.4
  - @editablejs/plugin-background-color@1.0.0-beta.1
  - @editablejs/plugin-font-color@1.0.0-beta.1
  - @editablejs/plugin-font-size@1.0.0-beta.1
  - @editablejs/plugin-context-menu@1.0.0-beta.23
  - @editablejs/plugin-hr@1.0.0-beta.5
  - @editablejs/plugin-image@1.0.0-beta.6
  - @editablejs/plugin-link@1.0.0-beta.6
  - @editablejs/plugin-table@1.0.0-beta.22

## 1.0.0-beta.22

### Minor Changes

- [`c250e92`](https://github.com/editablejs/editable/commit/c250e92d89d1e86885cc8e498c465396fb47fc66) Thanks [@big-camel](https://github.com/big-camel)! - refactor ui

### Patch Changes

- Updated dependencies [[`c250e92`](https://github.com/editablejs/editable/commit/c250e92d89d1e86885cc8e498c465396fb47fc66)]:
  - @editablejs/editor@1.0.0-beta.14
  - @editablejs/plugin-align@1.0.0-beta.3
  - @editablejs/plugin-blockquote@1.0.0-beta.15
  - @editablejs/plugin-context-menu@1.0.0-beta.22
  - @editablejs/plugin-heading@1.0.0-beta.14
  - @editablejs/plugin-hr@1.0.0-beta.4
  - @editablejs/plugin-image@1.0.0-beta.5
  - @editablejs/plugin-indent@1.0.0-beta.15
  - @editablejs/plugin-leading@1.0.0-beta.2
  - @editablejs/plugin-link@1.0.0-beta.5
  - @editablejs/plugin-list@1.0.0-beta.14
  - @editablejs/plugin-mark@1.0.0-beta.14
  - @editablejs/plugin-table@1.0.0-beta.21
  - @editablejs/plugin-fontsize@1.0.0-beta.14

## 1.0.0-beta.21

### Patch Changes

- [`f3279c7`](https://github.com/editablejs/editable/commit/f3279c7f96acdcdca92684a4ebf885eb05e7aac5) Thanks [@big-camel](https://github.com/big-camel)! - add leading plugin

- Updated dependencies [[`f3279c7`](https://github.com/editablejs/editable/commit/f3279c7f96acdcdca92684a4ebf885eb05e7aac5)]:
  - @editablejs/plugin-align@1.0.0-beta.2
  - @editablejs/plugin-ui@1.0.0-beta.14
  - @editablejs/plugin-leading@1.0.0-beta.1
  - @editablejs/plugin-context-menu@1.0.0-beta.21
  - @editablejs/plugin-hr@1.0.0-beta.3
  - @editablejs/plugin-image@1.0.0-beta.4
  - @editablejs/plugin-link@1.0.0-beta.4
  - @editablejs/plugin-table@1.0.0-beta.20
  - @editablejs/plugin-toolbar@1.0.0-beta.21

## 1.0.0-beta.20

### Patch Changes

- [`1bca53d`](https://github.com/editablejs/editable/commit/1bca53d995a2c6166481e33b858ec09217b3d7f7) Thanks [@big-camel](https://github.com/big-camel)! - add aling plugin

* [`1bca53d`](https://github.com/editablejs/editable/commit/1bca53d995a2c6166481e33b858ec09217b3d7f7) Thanks [@big-camel](https://github.com/big-camel)! - add align plugin

* Updated dependencies [[`1bca53d`](https://github.com/editablejs/editable/commit/1bca53d995a2c6166481e33b858ec09217b3d7f7), [`1bca53d`](https://github.com/editablejs/editable/commit/1bca53d995a2c6166481e33b858ec09217b3d7f7)]:
  - @editablejs/plugin-hr@1.0.0-beta.2
  - @editablejs/plugin-indent@1.0.0-beta.14
  - @editablejs/plugin-ui@1.0.0-beta.13
  - @editablejs/plugin-align@1.0.0-beta.1
  - @editablejs/plugin-table@1.0.0-beta.19
  - @editablejs/plugin-context-menu@1.0.0-beta.20
  - @editablejs/plugin-image@1.0.0-beta.3
  - @editablejs/plugin-link@1.0.0-beta.3
  - @editablejs/plugin-toolbar@1.0.0-beta.20

## 1.0.0-beta.19

### Patch Changes

- [`4fcf386`](https://github.com/editablejs/editable/commit/4fcf3868109e5352ee6ee947ef12e6fe6dc27556) Thanks [@big-camel](https://github.com/big-camel)! - add hr plugin

- Updated dependencies [[`4fcf386`](https://github.com/editablejs/editable/commit/4fcf3868109e5352ee6ee947ef12e6fe6dc27556)]:
  - @editablejs/plugin-blockquote@1.0.0-beta.14
  - @editablejs/plugin-image@1.0.0-beta.2
  - @editablejs/plugin-ui@1.0.0-beta.12
  - @editablejs/plugin-context-menu@1.0.0-beta.19
  - @editablejs/plugin-hr@1.0.0-beta.1
  - @editablejs/plugin-link@1.0.0-beta.2
  - @editablejs/plugin-table@1.0.0-beta.18
  - @editablejs/plugin-toolbar@1.0.0-beta.19

## 1.0.0-beta.18

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
  - @editablejs/plugin-blockquote@1.0.0-beta.13
  - @editablejs/plugin-context-menu@1.0.0-beta.18
  - @editablejs/plugin-fontsize@1.0.0-beta.13
  - @editablejs/plugin-heading@1.0.0-beta.13
  - @editablejs/plugin-indent@1.0.0-beta.13
  - @editablejs/plugin-link@1.0.0-beta.1
  - @editablejs/plugin-list@1.0.0-beta.13
  - @editablejs/plugin-mark@1.0.0-beta.13
  - @editablejs/plugin-table@1.0.0-beta.17
  - @editablejs/plugin-toolbar@1.0.0-beta.18
  - @editablejs/plugin-ui@1.0.0-beta.11
  - @editablejs/plugin-image@1.0.0-beta.1

## 1.0.0-beta.17

### Patch Changes

- [#34](https://github.com/editablejs/editable/pull/34) [`d7a7387`](https://github.com/editablejs/editable/commit/d7a7387c23f740cecb38177df2878bb6f2e6ec1d) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - add link plugin

* [#34](https://github.com/editablejs/editable/pull/34) [`885101f`](https://github.com/editablejs/editable/commit/885101f1a8d02ac388eb02bba884479f224a53ff) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - update ui

* Updated dependencies [[`74fb9df`](https://github.com/editablejs/editable/commit/74fb9dfc9d7c3cf959604302e204f99070d64ef6), [`d7a7387`](https://github.com/editablejs/editable/commit/d7a7387c23f740cecb38177df2878bb6f2e6ec1d), [`885101f`](https://github.com/editablejs/editable/commit/885101f1a8d02ac388eb02bba884479f224a53ff)]:
  - @editablejs/plugin-link@1.0.0-beta.0
  - @editablejs/editor@1.0.0-beta.12
  - @editablejs/plugin-context-menu@1.0.0-beta.17
  - @editablejs/plugin-table@1.0.0-beta.16
  - @editablejs/plugin-toolbar@1.0.0-beta.17
  - @editablejs/plugin-ui@1.0.0-beta.10
  - @editablejs/plugin-blockquote@1.0.0-beta.12
  - @editablejs/plugin-fontsize@1.0.0-beta.12
  - @editablejs/plugin-heading@1.0.0-beta.12
  - @editablejs/plugin-history@1.0.0-beta.12
  - @editablejs/plugin-indent@1.0.0-beta.12
  - @editablejs/plugin-list@1.0.0-beta.12
  - @editablejs/plugin-mark@1.0.0-beta.12

## 1.0.0-beta.16

### Patch Changes

- Updated dependencies [[`a0a603c`](https://github.com/editablejs/editable/commit/a0a603cd3e56663c73ad338d369692f5ad375aef)]:
  - @editablejs/editor@1.0.0-beta.11
  - @editablejs/plugin-blockquote@1.0.0-beta.11
  - @editablejs/plugin-context-menu@1.0.0-beta.16
  - @editablejs/plugin-fontsize@1.0.0-beta.11
  - @editablejs/plugin-heading@1.0.0-beta.11
  - @editablejs/plugin-history@1.0.0-beta.11
  - @editablejs/plugin-indent@1.0.0-beta.11
  - @editablejs/plugin-list@1.0.0-beta.11
  - @editablejs/plugin-mark@1.0.0-beta.11
  - @editablejs/plugin-table@1.0.0-beta.15
  - @editablejs/plugin-toolbar@1.0.0-beta.16

## 1.0.0-beta.15

### Patch Changes

- Updated dependencies [[`2fb4f42`](https://github.com/editablejs/editable/commit/2fb4f42227b5505fa9adfe5a7548750cd479944b)]:
  - @editablejs/editor@1.0.0-beta.10
  - @editablejs/plugin-table@1.0.0-beta.14
  - @editablejs/plugin-blockquote@1.0.0-beta.10
  - @editablejs/plugin-context-menu@1.0.0-beta.15
  - @editablejs/plugin-fontsize@1.0.0-beta.10
  - @editablejs/plugin-heading@1.0.0-beta.10
  - @editablejs/plugin-history@1.0.0-beta.10
  - @editablejs/plugin-indent@1.0.0-beta.10
  - @editablejs/plugin-list@1.0.0-beta.10
  - @editablejs/plugin-mark@1.0.0-beta.10
  - @editablejs/plugin-toolbar@1.0.0-beta.15

## 1.0.0-beta.14

### Patch Changes

- Updated dependencies [[`4175fcc`](https://github.com/editablejs/editable/commit/4175fcc10eab0b7926914529b0e49b105bccdec2), [`c8f2de7`](https://github.com/editablejs/editable/commit/c8f2de70655290969258b7b6ba140c7d6ed51c08)]:
  - @editablejs/plugin-table@1.0.0-beta.13
  - @editablejs/plugin-toolbar@1.0.0-beta.14
  - @editablejs/plugin-ui@1.0.0-beta.9
  - @editablejs/plugin-context-menu@1.0.0-beta.14

## 1.0.0-beta.13

### Patch Changes

- [`d9143b2`](https://github.com/editablejs/editable/commit/d9143b29b6c0c23d79641e61be64d4e164c58465) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - re ci

- Updated dependencies [[`d9143b2`](https://github.com/editablejs/editable/commit/d9143b29b6c0c23d79641e61be64d4e164c58465)]:
  - @editablejs/editor@1.0.0-beta.9
  - @editablejs/plugin-blockquote@1.0.0-beta.9
  - @editablejs/plugin-history@1.0.0-beta.9
  - @editablejs/plugin-context-menu@1.0.0-beta.13
  - @editablejs/plugin-fontsize@1.0.0-beta.9
  - @editablejs/plugin-heading@1.0.0-beta.9
  - @editablejs/plugin-indent@1.0.0-beta.9
  - @editablejs/plugin-list@1.0.0-beta.9
  - @editablejs/plugin-mark@1.0.0-beta.9
  - @editablejs/plugin-table@1.0.0-beta.12
  - @editablejs/plugin-toolbar@1.0.0-beta.13
  - @editablejs/plugin-ui@1.0.0-beta.8

## 1.0.0-beta.12

### Patch Changes

- Updated dependencies [[`2393373`](https://github.com/editablejs/editable/commit/2393373aa133d947509c721302d85834509054d8)]:
  - @editablejs/editor@1.0.0-beta.8
  - @editablejs/plugin-table@1.0.0-beta.11
  - @editablejs/plugin-toolbar@1.0.0-beta.12
  - @editablejs/plugin-blockquote@1.0.0-beta.8
  - @editablejs/plugin-context-menu@1.0.0-beta.12
  - @editablejs/plugin-fontsize@1.0.0-beta.8
  - @editablejs/plugin-heading@1.0.0-beta.8
  - @editablejs/plugin-history@1.0.0-beta.8
  - @editablejs/plugin-indent@1.0.0-beta.8
  - @editablejs/plugin-list@1.0.0-beta.8
  - @editablejs/plugin-mark@1.0.0-beta.8

## 1.0.0-beta.11

### Patch Changes

- Updated dependencies [[`e58e5e6`](https://github.com/editablejs/editable/commit/e58e5e6fa8c6e4dc22837d1d3c29de3011993332)]:
  - @editablejs/plugin-context-menu@1.0.0-beta.11
  - @editablejs/plugin-toolbar@1.0.0-beta.11
  - @editablejs/plugin-ui@1.0.0-beta.7
  - @editablejs/plugin-table@1.0.0-beta.10

## 1.0.0-beta.10

### Patch Changes

- Updated dependencies [[`824c85f`](https://github.com/editablejs/editable/commit/824c85f60a7e353c0bec69574ff8acd54df3b9a6)]:
  - @editablejs/editor@1.0.0-beta.7
  - @editablejs/plugin-blockquote@1.0.0-beta.7
  - @editablejs/plugin-context-menu@1.0.0-beta.10
  - @editablejs/plugin-toolbar@1.0.0-beta.10
  - @editablejs/plugin-fontsize@1.0.0-beta.7
  - @editablejs/plugin-heading@1.0.0-beta.7
  - @editablejs/plugin-history@1.0.0-beta.7
  - @editablejs/plugin-indent@1.0.0-beta.7
  - @editablejs/plugin-list@1.0.0-beta.7
  - @editablejs/plugin-mark@1.0.0-beta.7
  - @editablejs/plugin-table@1.0.0-beta.9

## 1.0.0-beta.9

### Patch Changes

- Updated dependencies [[`b1faaf5`](https://github.com/editablejs/editable/commit/b1faaf58ab2493e21218bf0a3c174381663a0073)]:
  - @editablejs/plugin-ui@1.0.0-beta.6
  - @editablejs/plugin-context-menu@1.0.0-beta.9
  - @editablejs/plugin-table@1.0.0-beta.8
  - @editablejs/plugin-toolbar@1.0.0-beta.9

## 1.0.0-beta.8

### Patch Changes

- Updated dependencies [[`f4251d5`](https://github.com/editablejs/editable/commit/f4251d513e682fd72e84926bdf63902e5f78fb76)]:
  - @editablejs/plugin-context-menu@1.0.0-beta.8
  - @editablejs/plugin-toolbar@1.0.0-beta.8
  - @editablejs/plugin-ui@1.0.0-beta.5
  - @editablejs/plugin-table@1.0.0-beta.7

## 1.0.0-beta.7

### Patch Changes

- Updated dependencies [[`3707987`](https://github.com/editablejs/editable/commit/3707987a1def303b92a323f02dcfac930bec1285)]:
  - @editablejs/plugin-context-menu@1.0.0-beta.7
  - @editablejs/plugin-toolbar@1.0.0-beta.7

## 1.0.0-beta.6

### Patch Changes

- Updated dependencies [[`7923293`](https://github.com/editablejs/editable/commit/79232932d34772aa75648b3df161f08dca1130a6)]:
  - @editablejs/editor@1.0.0-beta.6
  - @editablejs/plugin-blockquote@1.0.0-beta.6
  - @editablejs/plugin-context-menu@1.0.0-beta.6
  - @editablejs/plugin-fontsize@1.0.0-beta.6
  - @editablejs/plugin-heading@1.0.0-beta.6
  - @editablejs/plugin-history@1.0.0-beta.6
  - @editablejs/plugin-indent@1.0.0-beta.6
  - @editablejs/plugin-list@1.0.0-beta.6
  - @editablejs/plugin-mark@1.0.0-beta.6
  - @editablejs/plugin-table@1.0.0-beta.6
  - @editablejs/plugin-toolbar@1.0.0-beta.6

## 1.0.0-beta.5

### Patch Changes

- [`5ac5c2e`](https://github.com/editablejs/editable/commit/5ac5c2e5b4a879dc52c38d95712692f05a21ab78) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - split plugin-yjs package

- Updated dependencies [[`5ac5c2e`](https://github.com/editablejs/editable/commit/5ac5c2e5b4a879dc52c38d95712692f05a21ab78)]:
  - @editablejs/editor@1.0.0-beta.5
  - @editablejs/plugin-blockquote@1.0.0-beta.5
  - @editablejs/plugin-context-menu@1.0.0-beta.5
  - @editablejs/plugin-fontsize@1.0.0-beta.5
  - @editablejs/plugin-heading@1.0.0-beta.5
  - @editablejs/plugin-history@1.0.0-beta.5
  - @editablejs/plugin-indent@1.0.0-beta.5
  - @editablejs/plugin-list@1.0.0-beta.5
  - @editablejs/plugin-mark@1.0.0-beta.5
  - @editablejs/plugin-table@1.0.0-beta.5
  - @editablejs/plugin-toolbar@1.0.0-beta.5
  - @editablejs/plugin-ui@1.0.0-beta.4

## 1.0.0-beta.4

### Patch Changes

- Updated dependencies [[`d9250e0`](https://github.com/editablejs/editable/commit/d9250e0ec00951cd2246813ac13c5e1fa2a7faeb)]:
  - @editablejs/editor@1.0.0-beta.4
  - @editablejs/plugin-history@1.0.0-beta.4
  - @editablejs/plugin-blockquote@1.0.0-beta.4
  - @editablejs/plugin-context-menu@1.0.0-beta.4
  - @editablejs/plugin-fontsize@1.0.0-beta.4
  - @editablejs/plugin-heading@1.0.0-beta.4
  - @editablejs/plugin-indent@1.0.0-beta.4
  - @editablejs/plugin-list@1.0.0-beta.4
  - @editablejs/plugin-mark@1.0.0-beta.4
  - @editablejs/plugin-table@1.0.0-beta.4
  - @editablejs/plugin-toolbar@1.0.0-beta.4

## 1.0.0-beta.3

### Patch Changes

- [`4898015`](https://github.com/editablejs/editable/commit/489801580e1679b098f898625a9b28e7ec112332) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - add touch select

- Updated dependencies [[`4898015`](https://github.com/editablejs/editable/commit/489801580e1679b098f898625a9b28e7ec112332)]:
  - @editablejs/editor@1.0.0-beta.3
  - @editablejs/plugin-blockquote@1.0.0-beta.3
  - @editablejs/plugin-context-menu@1.0.0-beta.3
  - @editablejs/plugin-fontsize@1.0.0-beta.3
  - @editablejs/plugin-heading@1.0.0-beta.3
  - @editablejs/plugin-history@1.0.0-beta.3
  - @editablejs/plugin-indent@1.0.0-beta.3
  - @editablejs/plugin-list@1.0.0-beta.3
  - @editablejs/plugin-mark@1.0.0-beta.3
  - @editablejs/plugin-table@1.0.0-beta.3
  - @editablejs/plugin-toolbar@1.0.0-beta.3
  - @editablejs/plugin-ui@1.0.0-beta.3

## 1.0.0-beta.2

### Patch Changes

- [`0a02885`](https://github.com/editablejs/editable/commit/0a028851cee60fe7ff97a9b109138b3f5fba2db7) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - exports esm cjs

- Updated dependencies [[`0a02885`](https://github.com/editablejs/editable/commit/0a028851cee60fe7ff97a9b109138b3f5fba2db7)]:
  - @editablejs/editor@1.0.0-beta.2
  - @editablejs/plugin-blockquote@1.0.0-beta.2
  - @editablejs/plugin-context-menu@1.0.0-beta.2
  - @editablejs/plugin-fontsize@1.0.0-beta.2
  - @editablejs/plugin-heading@1.0.0-beta.2
  - @editablejs/plugin-history@1.0.0-beta.2
  - @editablejs/plugin-indent@1.0.0-beta.2
  - @editablejs/plugin-list@1.0.0-beta.2
  - @editablejs/plugin-mark@1.0.0-beta.2
  - @editablejs/plugin-table@1.0.0-beta.2
  - @editablejs/plugin-toolbar@1.0.0-beta.2
  - @editablejs/plugin-ui@1.0.0-beta.2

## 1.0.0-beta.1

### Patch Changes

- Updated dependencies [[`fdafeac`](https://github.com/editablejs/editable/commit/fdafeacb8da94a19fd5b74dab621add727b8d1fd)]:
  - @editablejs/editor@1.0.0-beta.1
  - @editablejs/plugin-blockquote@1.0.0-beta.1
  - @editablejs/plugin-context-menu@1.0.0-beta.1
  - @editablejs/plugin-fontsize@1.0.0-beta.1
  - @editablejs/plugin-heading@1.0.0-beta.1
  - @editablejs/plugin-history@1.0.0-beta.1
  - @editablejs/plugin-indent@1.0.0-beta.1
  - @editablejs/plugin-list@1.0.0-beta.1
  - @editablejs/plugin-mark@1.0.0-beta.1
  - @editablejs/plugin-table@1.0.0-beta.1
  - @editablejs/plugin-toolbar@1.0.0-beta.1
  - @editablejs/plugin-ui@1.0.0-beta.1

## 1.0.0-beta.0

### Major Changes

- [`015a4c7`](https://github.com/editablejs/editable/commit/015a4c788896d238bb67b09d117675a442e28903) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - publish

### Minor Changes

- [#13](https://github.com/editablejs/editable/pull/13) [`1e720a4`](https://github.com/editablejs/editable/commit/1e720a42cdffe82a5003df522c8021f431ba6674) Thanks [@yanmao-cc](https://github.com/yanmao-cc)! - first publish

### Patch Changes

- Updated dependencies [[`1e720a4`](https://github.com/editablejs/editable/commit/1e720a42cdffe82a5003df522c8021f431ba6674), [`015a4c7`](https://github.com/editablejs/editable/commit/015a4c788896d238bb67b09d117675a442e28903)]:
  - @editablejs/editor@1.0.0-beta.0
  - @editablejs/plugin-history@1.0.0-beta.0
  - @editablejs/plugin-table@1.0.0-beta.0
  - @editablejs/plugin-toolbar@1.0.0-beta.0
  - @editablejs/plugin-ui@1.0.0-beta.0
  - @editablejs/plugin-blockquote@1.0.0-beta.0
  - @editablejs/plugin-context-menu@1.0.0-beta.0
  - @editablejs/plugin-fontsize@1.0.0-beta.0
  - @editablejs/plugin-heading@1.0.0-beta.0
  - @editablejs/plugin-indent@1.0.0-beta.0
  - @editablejs/plugin-list@1.0.0-beta.0
  - @editablejs/plugin-mark@1.0.0-beta.0
