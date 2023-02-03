import { InsertTextOperation, Node, Text } from '@editablejs/models'
import { getProperties, getYTarget } from '@editablejs/yjs-transform'
import type Y from 'yjs'

export function insertText(sharedRoot: Y.XmlText, editorRoot: Node, op: InsertTextOperation): void {
  const { yParent: target, textRange } = getYTarget(sharedRoot, editorRoot, op.path)

  const targetNode = Node.get(editorRoot, op.path)
  if (!Text.isText(targetNode)) {
    throw new Error('Cannot insert text into non-text node')
  }

  target.insert(textRange.start + op.offset, op.text, getProperties(targetNode))
}
