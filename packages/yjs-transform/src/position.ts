import * as Y from 'yjs'
import { InsertDelta, RelativeRange, TextRange } from './types'
import { getInsertDeltaLength, yTextToInsertDelta } from './delta'
import { getEditorPath, getYTarget, yOffsetToEditorOffsets } from './location'
import { assertDocumentAttachment } from './yjs'
import { BasePoint, Node, Text, BaseRange } from '@editablejs/models'

export const STORED_POSITION_PREFIX = '__editorYjsStoredPosition_'

export function editorPointToRelativePosition(
  sharedRoot: Y.XmlText,
  editorRoot: Node,
  point: BasePoint,
): Y.RelativePosition {
  const { yTarget, yParent, textRange } = getYTarget(sharedRoot, editorRoot, point.path)

  if (yTarget) {
    throw new Error('Editor point points to a non-text element inside sharedRoot')
  }

  return Y.createRelativePositionFromTypeIndex(
    yParent,
    textRange.start + point.offset,
    point.offset === textRange.end ? -1 : 0,
  )
}

export function absolutePositionToEditorPoint(
  sharedRoot: Y.XmlText,
  editorRoot: Node,
  { type, index, assoc }: Y.AbsolutePosition,
): BasePoint | null {
  if (!(type instanceof Y.XmlText)) {
    throw new Error('Absolute position points to a non-XMLText')
  }

  const parentPath = getEditorPath(sharedRoot, editorRoot, type)
  const parent = Node.get(editorRoot, parentPath)

  if (Text.isText(parent)) {
    throw new Error("Absolute position doesn't match editorRoot, cannot descent into text")
  }

  const [pathOffset, textOffset] = yOffsetToEditorOffsets(parent, index, {
    assoc,
  })

  const target = parent.children[pathOffset]
  if (!Text.isText(target)) {
    return null
  }

  return { path: [...parentPath, pathOffset], offset: textOffset }
}

export function relativePositionToEditorPoint(
  sharedRoot: Y.XmlText,
  editorRoot: Node,
  pos: Y.RelativePosition,
): BasePoint | null {
  if (!sharedRoot.doc) {
    throw new Error("sharedRoot isn't attach to a yDoc")
  }

  const absPos = Y.createAbsolutePositionFromRelativePosition(pos, sharedRoot.doc)

  return absPos && absolutePositionToEditorPoint(sharedRoot, editorRoot, absPos)
}

export function getStoredPosition(sharedRoot: Y.XmlText, key: string): Y.RelativePosition | null {
  const rawPosition = sharedRoot.getAttribute(STORED_POSITION_PREFIX + key)
  if (!rawPosition) {
    return null
  }

  return Y.decodeRelativePosition(rawPosition)
}

export function getStoredPositions(sharedRoot: Y.XmlText): Record<string, Y.RelativePosition> {
  return Object.fromEntries(
    Object.entries(sharedRoot.getAttributes())
      .filter(([key]) => key.startsWith(STORED_POSITION_PREFIX))
      .map(([key, position]) => [
        key.slice(STORED_POSITION_PREFIX.length),
        Y.createRelativePositionFromJSON(position),
      ]),
  )
}

function getStoredPositionsAbsolute(sharedRoot: Y.XmlText) {
  assertDocumentAttachment(sharedRoot)

  return Object.fromEntries(
    Object.entries(sharedRoot.getAttributes())
      .filter(([key]) => key.startsWith(STORED_POSITION_PREFIX))
      .map(
        ([key, position]) =>
          [
            key.slice(STORED_POSITION_PREFIX.length),
            Y.createAbsolutePositionFromRelativePosition(
              Y.decodeRelativePosition(position),
              sharedRoot.doc,
            ),
          ] as const,
      )
      .filter(([, position]) => position),
  ) as Record<string, Y.AbsolutePosition>
}

export function removeStoredPosition(sharedRoot: Y.XmlText, key: string) {
  sharedRoot.removeAttribute(STORED_POSITION_PREFIX + key)
}

export function setStoredPosition(
  sharedRoot: Y.XmlText,
  key: string,
  position: Y.RelativePosition,
) {
  sharedRoot.setAttribute(STORED_POSITION_PREFIX + key, Y.encodeRelativePosition(position))
}

function getAbsolutePositionsInTextRange(
  absolutePositions: Record<string, Y.AbsolutePosition>,
  yTarget: Y.XmlText,
  textRange?: TextRange,
) {
  return Object.fromEntries(
    Object.entries(absolutePositions).filter(([, position]) => {
      if (position.type !== yTarget) {
        return false
      }

      if (!textRange) {
        return true
      }

      return position.assoc >= 0
        ? position.index >= textRange.start && position.index < textRange.end
        : position.index > textRange.start && position.index >= textRange.end
    }),
  )
}

function getAbsolutePositionsInYText(
  absolutePositions: Record<string, Y.AbsolutePosition>,
  yText: Y.XmlText,
  parentPath = '',
): Record<string, Record<string, Y.AbsolutePosition>> {
  const positions = {
    [parentPath]: getAbsolutePositionsInTextRange(absolutePositions, yText),
  }

  const insertDelta = yTextToInsertDelta(yText)
  insertDelta.forEach(({ insert }, i) => {
    if (insert instanceof Y.XmlText) {
      Object.assign(
        positions,
        getAbsolutePositionsInYText(
          absolutePositions,
          insert,
          parentPath ? `${parentPath}.${i}` : i.toString(),
        ),
      )
    }
  })

  return positions
}

export function getStoredPositionsInDeltaAbsolute(
  sharedRoot: Y.XmlText,
  yText: Y.XmlText,
  delta: InsertDelta,
  deltaOffset = 0,
) {
  const absolutePositions = getStoredPositionsAbsolute(sharedRoot)

  const positions = {
    '': getAbsolutePositionsInTextRange(absolutePositions, yText, {
      start: deltaOffset,
      end: deltaOffset + getInsertDeltaLength(delta),
    }),
  }

  delta.forEach(({ insert }, i) => {
    if (insert instanceof Y.XmlText) {
      Object.assign(positions, getAbsolutePositionsInYText(absolutePositions, insert, i.toString()))
    }
  })

  return positions
}

export function restoreStoredPositionsWithDeltaAbsolute(
  sharedRoot: Y.XmlText,
  yText: Y.XmlText,
  absolutePositions: Record<string, Record<string, Y.AbsolutePosition>>,
  delta: InsertDelta,
  newDeltaOffset = 0,
  previousDeltaOffset = 0,
  path = '',
) {
  const toRestore = absolutePositions[path]

  if (toRestore) {
    Object.entries(toRestore).forEach(([key, position]) => {
      setStoredPosition(
        sharedRoot,
        key,
        Y.createRelativePositionFromTypeIndex(
          yText,
          position.index - previousDeltaOffset + newDeltaOffset,
          position.assoc,
        ),
      )
    })
  }

  delta.forEach(({ insert }, i) => {
    if (insert instanceof Y.XmlText) {
      restoreStoredPositionsWithDeltaAbsolute(
        sharedRoot,
        insert,
        absolutePositions,
        yTextToInsertDelta(insert),
        0,
        0,
        path ? `${path}.${i}` : i.toString(),
      )
    }
  })
}

export function editorRangeToRelativeRange(
  sharedRoot: Y.XmlText,
  editorRoot: Node,
  range: BaseRange,
): RelativeRange {
  return {
    anchor: editorPointToRelativePosition(sharedRoot, editorRoot, range.anchor),
    focus: editorPointToRelativePosition(sharedRoot, editorRoot, range.focus),
  }
}

export function relativeRangeToEditorRange(
  sharedRoot: Y.XmlText,
  editorRoot: Node,
  range: RelativeRange,
): BaseRange | null {
  const anchor = relativePositionToEditorPoint(sharedRoot, editorRoot, range.anchor)

  if (!anchor) {
    return null
  }

  const focus = relativePositionToEditorPoint(sharedRoot, editorRoot, range.focus)

  if (!focus) {
    return null
  }

  return { anchor, focus }
}
