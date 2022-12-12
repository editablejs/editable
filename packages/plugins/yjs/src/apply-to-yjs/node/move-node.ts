import { MoveNodeOperation, Node, Path, Text } from '@editablejs/editor'
import {
  cloneInsertDeltaDeep,
  getInsertDeltaLength,
  yTextToInsertDelta,
} from '@editablejs/plugin-yjs-transform'
import * as Y from 'yjs'
import { Delta } from '../../types'
import { getYTarget } from '../../utils/location'
import {
  getStoredPositionsInDeltaAbsolute,
  restoreStoredPositionsWithDeltaAbsolute,
} from '../../utils/position'

export function moveNode(sharedRoot: Y.XmlText, slateRoot: Node, op: MoveNodeOperation): void {
  const newParentPath = Path.parent(op.newPath)
  const newPathOffset = op.newPath[op.newPath.length - 1]
  const parent = Node.get(slateRoot, newParentPath)
  if (Text.isText(parent)) {
    throw new Error('Cannot move slate node into text element')
  }
  const normalizedNewPath = [...newParentPath, Math.min(newPathOffset, parent.children.length)]

  const origin = getYTarget(sharedRoot, slateRoot, op.path)
  const target = getYTarget(sharedRoot, slateRoot, normalizedNewPath)
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
