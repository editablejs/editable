import { Node, SplitNodeOperation, Text } from '@editablejs/models'
import {
  cloneInsertDeltaDeep,
  sliceInsertDelta,
  yTextToInsertDelta,
  getStoredPositionsInDeltaAbsolute,
  restoreStoredPositionsWithDeltaAbsolute,
  getEditorNodeYLength,
  getYTarget,
} from '@editablejs/yjs-transform'
import * as Y from 'yjs'

export function splitNode(sharedRoot: Y.XmlText, editorRoot: Node, op: SplitNodeOperation): void {
  const target = getYTarget(sharedRoot, editorRoot, op.path)

  if (!target.editorTarget) {
    throw new Error('Y target without corresponding editor node')
  }

  if (!target.yTarget) {
    if (!Text.isText(target.editorTarget)) {
      throw new Error('Mismatch node type between y target and editor node')
    }

    const unset: Record<string, null> = {}
    target.targetDelta.forEach(element => {
      if (element.attributes) {
        Object.keys(element.attributes).forEach(key => {
          unset[key] = null
        })
      }
    })

    return target.yParent.format(
      target.textRange.start,
      target.textRange.end - target.textRange.start,
      { ...unset, ...op.properties },
    )
  }

  if (Text.isText(target.editorTarget)) {
    throw new Error('Mismatch node type between y target and editor node')
  }

  const splitTarget = getYTarget(target.yTarget, target.editorTarget, [op.position])

  const ySplitOffset = target.editorTarget.children
    .slice(0, op.position)
    .reduce((length, child) => length + getEditorNodeYLength(child), 0)

  const length = target.editorTarget.children.reduce(
    (current, child) => current + getEditorNodeYLength(child),
    0,
  )

  const splitDelta = sliceInsertDelta(
    yTextToInsertDelta(target.yTarget),
    ySplitOffset,
    length - ySplitOffset,
  )
  const clonedDelta = cloneInsertDeltaDeep(splitDelta)

  const storedPositions = getStoredPositionsInDeltaAbsolute(
    sharedRoot,
    target.yTarget,
    splitDelta,
    ySplitOffset,
  )

  const toInsert = new Y.XmlText()
  toInsert.applyDelta(clonedDelta, {
    sanitize: false,
  })

  Object.entries(op.properties).forEach(([key, value]) => {
    toInsert.setAttribute(key, value)
  })

  target.yTarget.delete(
    splitTarget.textRange.start,
    target.yTarget.length - splitTarget.textRange.start,
  )

  target.yParent.insertEmbed(target.textRange.end, toInsert)

  restoreStoredPositionsWithDeltaAbsolute(
    sharedRoot,
    toInsert,
    storedPositions,
    clonedDelta,
    0,
    ySplitOffset,
  )
}
