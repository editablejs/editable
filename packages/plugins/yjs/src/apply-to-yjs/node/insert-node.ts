import { InsertNodeOperation, Node, Text } from '@editablejs/editor'
import { getProperties, slateElementToYText } from '@editablejs/plugin-yjs-transform'
import * as Y from 'yjs'
import { getYTarget } from '../../utils/location'

export function insertNode(sharedRoot: Y.XmlText, slateRoot: Node, op: InsertNodeOperation): void {
  const { yParent, textRange } = getYTarget(sharedRoot, slateRoot, op.path)

  if (Text.isText(op.node)) {
    return yParent.insert(textRange.start, op.node.text, getProperties(op.node))
  }

  yParent.insertEmbed(textRange.start, slateElementToYText(op.node))
}
