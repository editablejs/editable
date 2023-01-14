import * as Y from 'yjs'
import { EditorView } from '@codemirror/view'
import { Editable } from '@editablejs/editor'

import { YRange } from './range'
import { ySync, ySyncFacet, YSyncConfig } from './sync'
import { CodeBlockEditor } from '../editor'
import { CODEBLOCK_YJS_FIELD, CODEBLOCK_YJS_KEY } from '../../constants'
import { redo, undo, yUndoManager, YUndoManagerConfig, yUndoManagerFacet } from './undomanager'
import { injectCodeBlockPlugins, IS_YJS, YJS_DEFAULT_VALUE } from '../../weak-map'

export { YRange, ySync, ySyncFacet, YSyncConfig }

export const withYCodeBlock = <T extends Editable>(editor: T, document: Y.Doc) => {
  const { normalizeNode, apply } = editor

  editor.apply = op => {
    if (!IS_YJS.get(editor)) return apply(op)
    switch (op.type) {
      case 'remove_node':
        if (CodeBlockEditor.isCodeBlock(editor, op.node)) {
          const docMap = document.getMap<Y.Doc>(CODEBLOCK_YJS_KEY)
          const doc = docMap.get(op.node.id)
          if (doc) doc.destroy()
          docMap.delete(op.node.id)
        }
        break
    }
    apply(op)
  }

  editor.normalizeNode = entry => {
    const [node] = entry
    if (CodeBlockEditor.isCodeBlock(editor, node)) {
      const docMap = document.getMap<Y.Doc>(CODEBLOCK_YJS_KEY)
      let doc = docMap.get(node.id)
      if (!doc) {
        doc = new Y.Doc({ autoLoad: true })
        const defaultValue = node.code
        doc.getText(CODEBLOCK_YJS_FIELD).insert(0, defaultValue)
        docMap.set(node.id, doc)
        YJS_DEFAULT_VALUE.set(editor, defaultValue)
      } else {
        YJS_DEFAULT_VALUE.delete(editor)
      }
    }
    normalizeNode(entry)
  }

  injectCodeBlockPlugins(editor, codeBlock => {
    const docMap = document.getMap<Y.Doc>(CODEBLOCK_YJS_KEY)
    const doc = docMap.get(codeBlock.id)
    if (!doc) return []
    IS_YJS.set(editor, true)
    doc.load()
    const yText = doc.getText(CODEBLOCK_YJS_FIELD)
    const ySyncConfig = new YSyncConfig(yText)
    const undoManager = new Y.UndoManager(yText)
    return [
      ySyncFacet.of(ySyncConfig),
      ySync,
      // undoManager
      yUndoManagerFacet.of(new YUndoManagerConfig(undoManager)),
      yUndoManager,
      EditorView.domEventHandlers({
        beforeinput(e, view) {
          if (e.inputType === 'historyUndo') return undo(view)
          if (e.inputType === 'historyRedo') return redo(view)
          return false
        },
      }),
    ]
  })

  return editor
}
