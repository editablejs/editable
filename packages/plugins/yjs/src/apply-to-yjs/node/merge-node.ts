import { MergeNodeOperation, Node, Path, Text } from '@editablejs/models'
import { getProperties, yTextToInsertDelta, cloneInsertDeltaDeep } from '@editablejs/yjs-transform'
import * as Y from 'yjs'
import { Delta } from '../../types'
import {
  getYTarget,
  getStoredPositionsInDeltaAbsolute,
  restoreStoredPositionsWithDeltaAbsolute,
} from '@editablejs/yjs-transform'

export function mergeNode(sharedRoot: Y.XmlText, editorRoot: Node, op: MergeNodeOperation): void {
  const target = getYTarget(sharedRoot, editorRoot, op.path)
  const prev = getYTarget(target.yParent, target.editorParent, Path.previous(op.path.slice(-1)))

  if (!target.yTarget !== !prev.yTarget) {
    throw new Error('Cannot merge y text with y element')
  }

  if (!prev.yTarget || !target.yTarget) {
    const { yParent: parent, textRange } = target

    const previousSibling = Node.get(editorRoot, Path.previous(op.path))
    if (!Text.isText(previousSibling)) {
      throw new Error('Path points to a y text but not a editor node')
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
