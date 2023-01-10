---
'@editablejs/breaker': patch
'@editablejs/editor': patch
'@editablejs/plugin-align': patch
'@editablejs/plugin-background-color': patch
'@editablejs/plugin-blockquote': patch
'@editablejs/plugin-context-menu': patch
'@editablejs/plugin-font-color': patch
'@editablejs/plugin-font-size': patch
'@editablejs/plugin-heading': patch
'@editablejs/plugin-history': patch
'@editablejs/plugin-hr': patch
'@editablejs/plugin-image': patch
'@editablejs/plugin-indent': patch
'@editablejs/plugin-leading': patch
'@editablejs/plugin-link': patch
'@editablejs/plugin-list': patch
'@editablejs/plugin-mark': patch
'@editablejs/plugin-mention': patch
'@editablejs/plugins': patch
'@editablejs/plugin-table': patch
'@editablejs/plugin-toolbar': patch
'@editablejs/plugin-yjs': patch
'@editablejs/plugin-yjs-transform': patch
'@editablejs/ui': patch
'@editablejs/plugin-yjs-websocket': patch
---

- Fix yjs and slate execution split-node, move-node, merge_node cannot update PointRef RangeRef PathRef related reference issues. Use @editablejs/plugin-yjs-websocket to pass meta additional messages
- Improve metion plugin
