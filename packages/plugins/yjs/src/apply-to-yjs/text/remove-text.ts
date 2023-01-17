import { Node, RemoveTextOperation } from '@editablejs/editor'
import type Y from 'yjs'
import { getYTarget } from '@editablejs/plugin-yjs-transform'

export function removeText(sharedRoot: Y.XmlText, editorRoot: Node, op: RemoveTextOperation): void {
  const { yParent: target, textRange } = getYTarget(sharedRoot, editorRoot, op.path)
  target.delete(textRange.start + op.offset, op.text.length)
}
