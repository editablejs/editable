---
'@editablejs/breaker': patch
'@editablejs/editor': patch
'@editablejs/plugin-blockquote': patch
'@editablejs/plugin-context-menu': patch
'@editablejs/plugin-heading': patch
'@editablejs/plugin-history': patch
'@editablejs/plugin-indent': patch
'@editablejs/plugin-link': patch
'@editablejs/plugin-list': patch
'@editablejs/plugin-mark': patch
'@editablejs/plugins': patch
'@editablejs/plugin-table': patch
'@editablejs/plugin-toolbar': patch
'@editablejs/plugin-yjs': patch
---

- Add picture plugin
- The history plugin adds `captureHistory` which can be used to filter operations that do not need to be stored in the history stack
- Fixed an error in restoring the cursor after dragging
- `editor.pasteText` -> `editor.insertTextFromClipboard`
- `editor.paste` -> `editor.insertFromClipboard`
- Add `editor.insertFile` api
- Fixed `selection` drawing related to void nodes
