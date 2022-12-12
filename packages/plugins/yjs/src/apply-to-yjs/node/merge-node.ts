import { MergeNodeOperation, Node, Path, Text } from '@editablejs/editor'
import {
  getProperties,
  yTextToInsertDelta,
  cloneInsertDeltaDeep,
} from '@editablejs/plugin-yjs-transform'
import * as Y from 'yjs'
import { Delta } from '../../types'
import { getYTarget } from '../../utils/location'
import {
  getStoredPositionsInDeltaAbsolute,
  restoreStoredPositionsWithDeltaAbsolute,
} from '../../utils/position'

export function mergeNode(sharedRoot: Y.XmlText, slateRoot: Node, op: MergeNodeOperation): void {
  const target = getYTarget(sharedRoot, slateRoot, op.path)
  const prev = getYTarget(target.yParent, target.slateParent, Path.previous(op.path.slice(-1)))

  if (!target.yTarget !== !prev.yTarget) {
    throw new Error('Cannot merge y text with y element')
  }

  if (!prev.yTarget || !target.yTarget) {
    const { yParent: parent, textRange } = target

    const previousSibling = Node.get(slateRoot, Path.previous(op.path))
    if (!Text.isText(previousSibling)) {
      throw new Error('Path points to a y text but not a slate node')
    }

    return parent.format(
      textRange.start,
      textRange.start - textRange.end,
      getProperties(previousSibling),
    )
  }

  const deltaApplyYOffset = prev.yTarget.length
  const targetDelta = yTextToInsertDelta(target.yTarget)
  const clonedDelta = cloneInsertDeltaDeep(targetDelta)

  const storedPositions = getStoredPositionsInDeltaAbsolute(
    sharedRoot,
    target.yTarget,
    targetDelta,
    deltaApplyYOffset,
  )

  const applyDelta: Delta = [{ retain: deltaApplyYOffset }, ...clonedDelta]

  prev.yTarget.applyDelta(applyDelta, {
    sanitize: false,
  })

  target.yParent.delete(target.textRange.start, target.textRange.end - target.textRange.start)

  restoreStoredPositionsWithDeltaAbsolute(
    sharedRoot,
    prev.yTarget,
    storedPositions,
    clonedDelta,
    deltaApplyYOffset,
  )
}
