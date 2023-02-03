import { MoveNodeOperation, Node, Path, Text } from '@editablejs/models'
import {
  cloneInsertDeltaDeep,
  getInsertDeltaLength,
  yTextToInsertDelta,
} from '@editablejs/yjs-transform'
import * as Y from 'yjs'
import { Delta } from '../../types'
import { getYTarget } from '@editablejs/yjs-transform'
import {
  getStoredPositionsInDeltaAbsolute,
  restoreStoredPositionsWithDeltaAbsolute,
} from '@editablejs/yjs-transform'

export function moveNode(sharedRoot: Y.XmlText, editorRoot: Node, op: MoveNodeOperation): void {
  const newParentPath = Path.parent(op.newPath)
  const newPathOffset = op.newPath[op.newPath.length - 1]
  const parent = Node.get(editorRoot, newParentPath)
  if (Text.isText(parent)) {
    throw new Error('Cannot move editor node into text element')
  }
  const normalizedNewPath = [...newParentPath, Math.min(newPathOffset, parent.children.length)]

  const origin = getYTarget(sharedRoot, editorRoot, op.path)
  const target = getYTarget(sharedRoot, editorRoot, normalizedNewPath)
  const insertDelta = cloneInsertDeltaDeep(origin.targetDelta)

  const storedPositions = getStoredPositionsInDeltaAbsolute(
    sharedRoot,
    origin.yParent,
    origin.targetDelta,
  )

  origin.yParent.delete(origin.textRange.start, origin.textRange.end - origin.textRange.start)

  const targetLength = getInsertDeltaLength(yTextToInsertDelta(target.yParent))
  const deltaApplyYOffset = Math.min(target.textRange.start, targetLength)
  const applyDelta: Delta = [{ retain: deltaApplyYOffset }, ...insertDelta]

  target.yParent.applyDelta(applyDelta, { sanitize: false })

  restoreStoredPositionsWithDeltaAbsolute(
    sharedRoot,
    target.yParent,
    storedPositions,
    insertDelta,
    deltaApplyYOffset,
    origin.textRange.start,
  )
}
