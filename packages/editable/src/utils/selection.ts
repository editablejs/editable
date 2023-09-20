import {
  Editor,
  Node,
  Range,
  Element,
  NodeEntry,
  Path,
  DOMElement,
  DOMRange,
  isDOMElement,
} from '@editablejs/models'
import { Editable } from '../plugin/editable'
import {
  DATA_EDITABLE_COMPOSITION,
  DATA_EDITABLE_NODE,
  DATA_EDITABLE_STRING,
  DATA_EDITABLE_ZERO_WIDTH,
} from './constants'

interface LineRectangle {
  top: number
  height: number
  bottom: number
  left: number
  right: number
}

/**
 * Splits the rectangles into lines based on their positions.
 * @param rects
 */
const splitRectsIntoLines = (rects: DOMRect[] | DOMRectList) => {
  const lines: Map<LineRectangle, DOMRect[]> = new Map()
  if (rects.length === 0) return lines

  const lineKeys: LineRectangle[] = []

  /**
   * Finds the line that the rectangle belongs to.
   * @param rect
   */
  const findLineKey = (rect: DOMRect) => {
    for (const lineKey of lineKeys) {
      const { right } = lineKey
      const previousRects = lines.get(lineKey)
      const lastRect = previousRects
        ? previousRects
            .concat()
            .reverse()
            .find(p => p.width > 0) ?? previousRects[previousRects.length - 1]
        : null
      if (isRectInLine(rect, lineKey) && rect.left <= (lastRect ? lastRect.right : right) + 1) {
        return lineKey
      }
    }
    return null
  }

  // Loop through each rectangle and find its line
  for (let r = 0; r < rects.length; r++) {
    const rect = rects[r]
    const key = findLineKey(rect)
    if (key) {
      lines.get(key)?.push(rect)
    } else {
      const lineRect = {
        top: rect.top,
        height: rect.height,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      }
      lines.set(lineRect, [rect])
      lineKeys.push(lineRect)
    }
  }

  // Find the minimum top, maximum bottom, and maximum right for each line
  for (const [line, rects] of lines) {
    // If there's only one rectangle in the line, skip
    if (rects.length === 1) continue

    let minTop = line.top,
      maxBottom = line.bottom,
      maxRight = line.right

    // Compare each rectangle
    for (const rect of rects) {
      const { top, bottom, right } = rect
      if (top < minTop) minTop = top
      if (bottom > maxBottom) maxBottom = bottom
      if (right > maxRight && rect.width > 0) maxRight = right
    }
    line.top = minTop
    line.bottom = maxBottom
    line.right = maxRight
  }
  return lines
}

/**
 * Calculates the height of a node based on line height and font size
 * @param el The DOM element to calculate height for
 * @returns The calculated height
 */
const calculateElementHeight = (el: DOMElement) => {
  const { lineHeight, fontSize } = window.getComputedStyle(el)

  // TODO: Handle pt, em, rem units

  let height = 0
  // Ends with px
  if (lineHeight.endsWith('px')) {
    height = parseFloat(lineHeight)
    return height
  }
  // Ends with %
  else if (lineHeight.endsWith('%')) {
    height = parseInt(lineHeight, 10) / 100
  }
  // Number
  else if (/^\d+(\.\d+)?$/.test(lineHeight)) {
    height = parseFloat(lineHeight)
  } else {
    return el.getBoundingClientRect().height
  }

  let size = 0
  if (fontSize.endsWith('px')) {
    size = parseInt(fontSize, 10)
  }

  return height * size
}

/**
 * Resets the DOMRect of an element to the specified height
 * @param rect The DOMRect to reset
 * @param height The new height for the rect
 * @returns The reset DOMRect
 */
const resetElementRect = (rect: DOMRect, height: number) => {
  const oldHeight = rect.height
  if (oldHeight >= height) return rect
  const top = rect.top + (oldHeight - height) / 2
  return new DOMRect(rect.left, top, rect.width, height)
}

/**
 * Check if a given DOMRect intersects with a given line defined by its top, bottom, and height values
 * @param {DOMRect} rect - The DOMRect to check
 * @param {Object} line - An object with top, bottom, and height properties representing the line
 * @return {Boolean} - True if the rect intersects with the line, false otherwise
 */
const isRectInLine = (rect: DOMRect, line: Record<'top' | 'bottom' | 'height', number>) => {
  const deltaEdge = rect.height / 3
  return (
    // Check if the rect is fully contained within the line
    (rect.top >= line.top &&
      (rect.bottom <= line.bottom ||
        // Check if the top of the rect is in the line and the overflow of the bottom is within 2/3
        rect.top + deltaEdge < line.bottom ||
        // Check if the bottom of the rect is within 2/3 from the top of the line and the top of the rect is above the bottom of the line
        (rect.top <= line.top + line.height / 3 && rect.bottom > line.top))) ||
    // Check if the rect covers the height of the line and the line is within the top and bottom of the rect
    (rect.top <= line.top &&
      (rect.bottom >= line.bottom ||
        // Check if the top of the rect is above or equal to the top of the line and the bottom of the rect is within 2/3 of the line
        rect.bottom - deltaEdge > line.top)) ||
    // Check if the bottom of the rect is within 2/3 from the bottom of the line and the top of the rect is above the bottom of the line
    (rect.bottom <= line.bottom &&
      rect.bottom >= line.bottom - line.height / 3 &&
      rect.top < line.bottom)
  )
}
/**
 * Find the maximum position in the line of the top position in the el node
 * @param editor - The Editor instance
 * @param element - The DOM element
 * @param top - The top position
 * @param bottom - The bottom position
 * @returns - Object containing the line rect information
 */
const matchHighest = (editor: Editor, element: DOMElement, top: number, bottom: number) => {
  const lineRect = {
    top,
    height: bottom - top,
    bottom,
  }

  /**
   * Compare the height of the current rect with the line rect
   * and update the line rect with the highest values
   * @param rect - The current rect
   */
  const compareHeight = (rect: DOMRect) => {
    if (isRectInLine(rect, lineRect)) {
      const newTop = lineRect.top < rect.top ? lineRect.top : rect.top
      const newBottom = lineRect.bottom > rect.bottom ? lineRect.bottom : rect.bottom
      lineRect.height = newBottom - newTop
      lineRect.top = newTop
      lineRect.bottom = newBottom
    }
  }

  /**
   * Recursively find the child nodes of the element and compare their rects
   * @param element - The DOM element
   */
  const match = (element: DOMElement) => {
    for (const child of element.childNodes) {
      if (isDOMElement(child)) {
        const hasNode = child.hasAttribute(DATA_EDITABLE_NODE)
        const node = hasNode ? Editable.toEditorNode(editor, child) : null
        if (node) {
          if (Element.isElement(node)) {
            if (editor.isVoid(node)) {
              const rect = resetElementRect(
                child.getBoundingClientRect(),
                calculateElementHeight(child),
              )
              compareHeight(rect)
            } else if (editor.isInline(node)) {
              const height = calculateElementHeight(child)
              const rects = child.getClientRects()
              for (let r = 0; r < rects.length; r++) {
                const rect = resetElementRect(rects[r], height)
                compareHeight(rect)
              }
            } else {
              match(child)
            }
          } else {
            const nodes = child.querySelectorAll(
              `[${DATA_EDITABLE_STRING}], [${DATA_EDITABLE_COMPOSITION}], [${DATA_EDITABLE_ZERO_WIDTH}]`,
            )
            nodes.forEach(node => {
              const height = calculateElementHeight(node)
              const rects = node.getClientRects()
              for (let r = 0; r < rects.length; r++) {
                const rect = resetElementRect(rects[r], height)
                compareHeight(rect)
              }
            })
          }
        } else {
          match(child)
        }
      }
    }
  }

  match(element)
  return lineRect
}
/**
 * Get the line rectangles of a given node in an editor.
 * @param editor The editor instance.
 * @param node The node to get line rectangles of.
 * @param minWidth The minimum width of the line rectangles. Default value is 4.
 * @returns An array of DOMRect objects representing the line rectangles.
 */
export const getLineRectsByNode = (editor: Editor, node: Node, minWidth = 4) => {
  const path = Editable.findPath(editor, node)
  const block: NodeEntry | undefined =
    Editor.isBlock(editor, node) && path.length === 1
      ? [node, path]
      : Editor.above<Element>(editor, {
          at: path,
          match: n => Editor.isBlock(editor, n),
          mode: 'highest',
        })
  if (!block) return []
  const domEl = Editable.toDOMNode(editor, block[0])
  const domRect = domEl.getBoundingClientRect()
  const range = document.createRange()
  range.selectNodeContents(Editable.toDOMNode(editor, node))
  const lines = splitRectsIntoLines(range.getClientRects())
  const lineRects: DOMRect[] = []
  for (const [line, rects] of lines) {
    let width = line.right - line.left
    const lineRect = matchHighest(editor, domEl, line.top, line.bottom)
    line.top = lineRect.top
    line.height = lineRect.height
    line.bottom = lineRect.bottom
    // 空节点的宽度给个最小值
    if (width < 1 && domRect.left === rects[0].left) {
      width = minWidth
    }
    lineRects.push(new DOMRect(rects[0].left, line.top, width, line.height))
  }
  return lineRects
}

/**
 * Get DOMRect objects split by line within range
 * @param editor
 * @param range
 * @param minWidth minimum width of empty node, default to 4
 * @returns array of DOMRect objects
 */
export const getLineRectsByRange = (editor: Editor, range: Range, minWidth = 4) => {
  const anchor = Range.start(range)
  const focus = Range.end(range)
  // 开始位置的 block节点
  const anchorEntry = Editor.above<Element>(editor, {
    at: anchor,
    match: n => Editor.isBlock(editor, n),
    mode: 'lowest',
  })
  // 结束位置的 block 节点
  const focusEntry = Editor.above<Element>(editor, {
    at: focus,
    match: n => Editor.isBlock(editor, n),
    mode: 'lowest',
  })
  if (!anchorEntry || !focusEntry) return []

  const blockRects: DOMRect[] = []
  const rectMap: Map<
    DOMRect,
    {
      dom: DOMElement
      element: Element
    }
  > = new Map()

  let [startBlock, startPath] = anchorEntry
  let [_, endPath] = focusEntry
  const ranges: DOMRange[] = []
  let isStart = true
  let next: NodeEntry<Element> | undefined = anchorEntry
  while (next) {
    const [nextBlock, nextPath] = next as NodeEntry<Element>
    const element = Editable.toDOMNode(editor, nextBlock)
    const rect = element.getBoundingClientRect()
    rectMap.set(rect, {
      dom: element,
      element: nextBlock,
    })
    blockRects.push(rect)

    if (Path.equals(nextPath, endPath)) break
    if (!isStart) {
      const range = document.createRange()
      range.selectNodeContents(element)
      ranges.push(range)
    } else {
      isStart = false
    }
    next = Editor.next<Element>(editor, {
      at: nextPath,
      match: n => Editor.isBlock(editor, n),
    })
  }
  if (Path.equals(startPath, endPath)) {
    ranges.unshift(Editable.toDOMRange(editor, range))
  } else {
    ranges.unshift(
      Editable.toDOMRange(editor, {
        anchor,
        focus: Editor.end(editor, {
          path: startPath,
          offset: startBlock.children.length,
        }),
      }),
    )
    ranges.push(
      Editable.toDOMRange(editor, {
        anchor: Editor.start(editor, {
          path: endPath,
          offset: 0,
        }),
        focus,
      }),
    )
  }

  // 拆分的行
  const rects: DOMRect[] = []
  for (const range of ranges) {
    rects.push(...range.getClientRects())
  }
  const lines = splitRectsIntoLines(rects)
  const lineRects: DOMRect[] = []
  let prevLineRect: DOMRect | null = null
  for (const [line, rects] of lines) {
    // 找到对应行所在的 element
    const blockRect = blockRects.find(
      r =>
        isRectInLine(r, line) &&
        (line.left >= r.left || Math.abs(line.left - r.left) < 1) &&
        (line.right <= r.right || Math.abs(line.right - r.right) < 1),
    )
    const block = blockRect ? rectMap.get(blockRect) : null

    let width = line.right - line.left
    if (block) {
      const { dom, element } = block
      const lineRect = matchHighest(editor, dom, line.top, line.bottom)
      line.top = lineRect.top
      line.height = lineRect.height
      // 空节点的宽度给个最小值
      if (
        dom &&
        Editor.isEmpty(editor, element) &&
        width < 1 &&
        dom.getBoundingClientRect().left === line.left
      ) {
        width = minWidth
      }
    }
    // 去除行与行直接多余覆盖部分
    if (prevLineRect && prevLineRect.bottom > line.top) {
      const diffVal = prevLineRect.bottom - line.top
      line.top += diffVal
      line.height -= diffVal
    }
    const lineRect = new DOMRect(rects[0].left, line.top, width, line.height)

    prevLineRect = lineRect
    lineRects.push(lineRect)
  }
  return lineRects
}
