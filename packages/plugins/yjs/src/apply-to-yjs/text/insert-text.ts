import { InsertTextOperation, Node, Text } from '@editablejs/editor'
import { getProperties } from '@editablejs/plugin-yjs-transform'
import type Y from 'yjs'
import { getYTarget } from '../../utils/location'

export function insertText(sharedRoot: Y.XmlText, slateRoot: Node, op: InsertTextOperation): void {
  const { yParent: target, textRange } = getYTarget(sharedRoot, slateRoot, op.path)

  const targetNode = Node.get(slateRoot, op.path)
  if (!Text.isText(targetNode)) {
    throw new Error('Cannot insert text into non-text node')
  }

  target.insert(textRange.start + op.offset, op.text, getProperties(targetNode))
}
