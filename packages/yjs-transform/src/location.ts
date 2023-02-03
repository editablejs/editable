import { Element, Node, Path, Text } from '@editablejs/models'
import * as Y from 'yjs'
import { sliceInsertDelta, yTextToInsertDelta } from './delta'
import { YTarget } from './types'

export function getEditorNodeYLength(node: Node | undefined): number {
  if (!node) {
    return 0
  }

  return Text.isText(node) ? node.text.length : 1
}

export function editorPathOffsetToYOffset(element: Element, pathOffset: number) {
  return element.children
    .slice(0, pathOffset)
    .reduce((yOffset, node) => yOffset + getEditorNodeYLength(node), 0)
}

export function getYTarget(yRoot: Y.XmlText, editorRoot: Node, path: Path): YTarget {
  if (path.length === 0) {
    throw new Error('Path has to a have a length >= 1')
  }

  if (Text.isText(editorRoot)) {
    throw new Error('Cannot descent into editor text')
  }

  const [pathOffset, ...childPath] = path

  const yOffset = editorPathOffsetToYOffset(editorRoot, pathOffset)
  const targetNode = editorRoot.children[pathOffset]

  const delta = yTextToInsertDelta(yRoot)
  const targetLength = getEditorNodeYLength(targetNode)

  const targetDelta = sliceInsertDelta(delta, yOffset, targetLength)
  if (targetDelta.length > 1) {
    throw new Error("Path doesn't match yText, yTarget spans multiple nodes")
  }

  const yTarget = targetDelta[0]?.insert
  if (childPath.length > 0) {
    if (!(yTarget instanceof Y.XmlText)) {
      throw new Error("Path doesn't match yText, cannot descent into non-yText")
    }

    return getYTarget(yTarget, targetNode, childPath)
  }

  return {
    yParent: yRoot,
    textRange: { start: yOffset, end: yOffset + targetLength },
    yTarget: yTarget instanceof Y.XmlText ? yTarget : undefined,
    editorParent: editorRoot,
    editorTarget: targetNode,
    targetDelta,
  }
}

export function yOffsetToEditorOffsets(
  parent: Element,
  yOffset: number,
  opts: { assoc?: number; insert?: boolean } = {},
): [number, number] {
  const { assoc = 0, insert = false } = opts

  let currentOffset = 0
  let lastNonEmptyPathOffset = 0
  for (let pathOffset = 0; pathOffset < parent.children.length; pathOffset++) {
    const child = parent.children[pathOffset]
    const nodeLength = Text.isText(child) ? child.text.length : 1

    if (nodeLength > 0) {
      lastNonEmptyPathOffset = pathOffset
    }

    const endOffset = currentOffset + nodeLength
    if (nodeLength > 0 && (assoc >= 0 ? endOffset > yOffset : endOffset >= yOffset)) {
      return [pathOffset, yOffset - currentOffset]
    }

    currentOffset += nodeLength
  }

  if (yOffset > currentOffset + (insert ? 1 : 0)) {
    throw new Error('yOffset out of bounds')
  }

  if (insert) {
    return [parent.children.length, 0]
  }

  const child = parent.children[lastNonEmptyPathOffset]
  const textOffset = Text.isText(child) ? child.text.length : 1
  return [lastNonEmptyPathOffset, textOffset]
}

export function getEditorPath(sharedRoot: Y.XmlText, editorRoot: Node, yText: Y.XmlText): Path {
  const yNodePath = [yText]
  while (yNodePath[0] !== sharedRoot) {
    const { parent: yParent } = yNodePath[0]

    if (!yParent) {
      throw new Error("yText isn't a descendant of root element")
    }

    if (!(yParent instanceof Y.XmlText)) {
      throw new Error('Unexpected y parent type')
    }

    yNodePath.unshift(yParent)
  }

  if (yNodePath.length < 2) {
    return []
  }

  let editorParent = editorRoot
  return yNodePath.reduce<Path>((path, yParent, idx) => {
    const yChild = yNodePath[idx + 1]
    if (!yChild) {
      return path
    }

    let yOffset = 0
    const currentDelta = yTextToInsertDelta(yParent)
    for (const element of currentDelta) {
      if (element.insert === yChild) {
        break
      }

      yOffset += typeof element.insert === 'string' ? element.insert.length : 1
    }

    if (Text.isText(editorParent)) {
      throw new Error('Cannot descent into editor text')
    }

    const [pathOffset] = yOffsetToEditorOffsets(editorParent, yOffset)
    editorParent = editorParent.children[pathOffset]
    return path.concat(pathOffset)
  }, [])
}
