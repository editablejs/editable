import { InsertNodeOperation, Node, Text } from '@editablejs/editor'
import { getYTarget, getProperties, editorElementToYText } from '@editablejs/plugin-yjs-transform'
import * as Y from 'yjs'

export function insertNode(sharedRoot: Y.XmlText, editorRoot: Node, op: InsertNodeOperation): void {
  const { yParent, textRange } = getYTarget(sharedRoot, editorRoot, op.path)

  if (Text.isText(op.node)) {
    return yParent.insert(textRange.start, op.node.text, getProperties(op.node))
  }

  yParent.insertEmbed(textRange.start, editorElementToYText(op.node))
}
