import * as Y from 'yjs'
import { Editable } from '@editablejs/editor'
import { Awareness } from '@editablejs/yjs-protocols/awareness'
import { withProviderProtocol } from '@editablejs/protocols/provider'
import { YRange } from './range'
import { ySync, ySyncFacet, YSyncConfig } from './sync'
import { CodeBlockEditor } from '../editor'
import { CODEBLOCK_YJS_FIELD, CODEBLOCK_YJS_KEY } from '../../constants'
import { YJS_AWARENESS_WEAK_MAP, YJS_DOC_WEAK_MAP } from '../../weak-map'
import { yExtension, YExtensionConfig, yExtensionnFacet } from './extension'

export { YRange, ySync, ySyncFacet, YSyncConfig }

export const withYCodeBlock = <T extends Editable>(
  editor: T,
  document: Y.Doc,
  awareness: Awareness,
) => {
  if (!CodeBlockEditor.isCodeBlockEditor(editor)) {
    throw new Error('withYCodeBlock only support CodeBlockEditor')
  }

  const { normalizeNode, apply, getCodeMirrorExtensions } = editor

  const providerProtocol = withProviderProtocol(editor)

  editor.getCodeMirrorExtensions = (id: string) => {
    const yExtensionConfig = new YExtensionConfig(id, editor)
    return [...getCodeMirrorExtensions(id), yExtensionnFacet.of(yExtensionConfig), yExtension]
  }

  editor.apply = op => {
    if (!providerProtocol.connected()) return apply(op)
    switch (op.type) {
      case 'remove_node':
        // 删除代码块时，销毁 Y.Doc
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
    // 插入代码块时，初始化 Y.Doc
    if (CodeBlockEditor.isCodeBlock(editor, node) && providerProtocol.connected()) {
      const docMap = document.getMap<Y.Doc>(CODEBLOCK_YJS_KEY)
      let doc = docMap.get(node.id)
      if (!doc) {
        doc = new Y.Doc({ autoLoad: true })
        const defaultValue = node.code
        doc.getText(CODEBLOCK_YJS_FIELD).insert(0, defaultValue)
        docMap.set(node.id, doc)
      }
    }
    normalizeNode(entry)
  }

  YJS_DOC_WEAK_MAP.set(editor, document)
  YJS_AWARENESS_WEAK_MAP.set(editor, awareness)

  return editor
}
