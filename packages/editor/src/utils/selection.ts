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

interface LineRect {
  top: number
  height: number
  bottom: number
  left: number
  right: number
}

const splitLines = (rects: DOMRect[] | DOMRectList) => {
  const lines: Map<LineRect, DOMRect[]> = new Map()
  if (rects.length === 0) return lines
  const lineKeys: LineRect[] = []
  // 找出每个 rect 所在的行的 key
  const findKey = (rect: DOMRect) => {
    for (const lineKey of lineKeys) {
      const { top, bottom, right } = lineKey
      const prevs = lines.get(lineKey)
      const last = prevs
        ? prevs
            .concat()
            .reverse()
            .find(p => p.width > 0) ?? prevs[prevs.length - 1]
        : null
      if (inLine(rect, lineKey) && rect.left <= (last ? last.right : right) + 1) {
        return lineKey
      }
    }
    return null
  }
  // 循环每个 rect，找出所在的行
  for (let r = 0; r < rects.length; r++) {
    const rect = rects[r]
    const key = findKey(rect)
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
  // 找出每行的最小 top，最大 bottom，最大 right
  for (const [line, rects] of lines) {
    // 一行只有一个 rect，直接跳过
    if (rects.length === 1) continue
    let minTop = line.top,
      maxBottom = line.bottom,
      maxRight = line.right
    // 循环比对每个 rect
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
 * 计算节点的高度，lineHeight * fontSize
 * @param el
 * @returns
 */
const calcElementHeight = (el: DOMElement) => {
  const { lineHeight, fontSize } = getComputedStyle(el)

  // TODO: pt em rem

  let height = 0
  // endsWith px
  if (lineHeight.endsWith('px')) {
    height = parseFloat(lineHeight)
    return height
  }
  // endsWith %
  else if (lineHeight.endsWith('%')) {
    height = parseInt(lineHeight, 10) / 100
  }
  // number
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

const resetElementRect = (rect: DOMRect, height: number) => {
  const oldHeight = rect.height
  if (oldHeight >= height) return rect
  const top = rect.top + (oldHeight - height) / 2
  return new DOMRect(rect.left, top, rect.width, height)
}

const inLine = (rect: DOMRect, line: Record<'top' | 'bottom' | 'height', number>) => {
  const deltaEdge = rect.height / 3
  return (
    // 1. 介于行 top 与 bottom 之间，完全被行包住
    (rect.top >= line.top &&
      (rect.bottom <= line.bottom ||
        // 2. 节点的 top 在行内，且溢出行的 bottom 在3分之2以内
        rect.top + deltaEdge < line.bottom ||
        // 3. 节点 bottom 在行的 top 下方至少 3分之2处，且 节点 top 位于行的 bottom 上方
        (rect.top <= line.top + line.height / 3 && rect.bottom > line.top))) ||
    // 4. 覆盖了行的高度，行 位于 rect 的 top 与 bottom 之间
    (rect.top <= line.top &&
      (rect.bottom >= line.bottom ||
        // 5. 节点的 top 位于行的上方或相等，且底部的高度至少3分之2在行内
        rect.bottom - deltaEdge > line.top)) ||
    // 6. 节点 top 在行的 bottom 上方至少 3分之2处，且 节点 bottom 位于行的 top 下方
    (rect.bottom <= line.bottom &&
      rect.bottom >= line.bottom - line.height / 3 &&
      rect.top < line.bottom)
  )
}

/**
 * 找到top位置在el节点中所在行的最大位置
 * @param editor
 * @param element
 * @param top
 * @param bottom
 * @returns
 */
const matchHighest = (editor: Editor, element: DOMElement, top: number, bottom: number) => {
  const lineRect = {
    top: top,
    height: bottom - top,
    bottom: bottom,
  }

  const compareHeight = (rect: DOMRect) => {
    if (inLine(rect, lineRect)) {
      const top = lineRect.top < rect.top ? lineRect.top : rect.top
      const bottom = lineRect.bottom > rect.bottom ? lineRect.bottom : rect.bottom
      lineRect.height = bottom - top
      lineRect.top = top
      lineRect.bottom = bottom
    }
  }

  const match = (element: DOMElement) => {
    for (const child of element.childNodes) {
      if (isDOMElement(child)) {
        const hasNode = child.hasAttribute(DATA_EDITABLE_NODE)
        const node = hasNode ? Editable.toSlateNode(editor, child) : null
        if (node) {
          if (Element.isElement(node)) {
            if (editor.isVoid(node)) {
              const rect = resetElementRect(child.getBoundingClientRect(), calcElementHeight(child))
              compareHeight(rect)
            } else if (editor.isInline(node)) {
              const height = calcElementHeight(child)
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
              const height = calcElementHeight(node)
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
        // else if(!child.hasAttribute('data-no-selection')){
        //   const display = window.getComputedStyle(child).display
        //   if(display === 'inline') {
        //     const rects = child.getClientRects()
        //     for(let r = 0; r < rects.length; r++) {
        //       const rect = rects[r]
        //       compareHeight(rect)
        //     }
        //   } else {
        //     match(child)
        //   }
        // }
      }
    }
  }

  match(element)
  return lineRect
}

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
  const lines = splitLines(range.getClientRects())
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
 * 在范围内获取按行分割的DOMRect对象
 * @param editor
 * @param range
 * @returns
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
  const rectMap: Map<DOMRect, DOMElement> = new Map()

  let [startBlock, startPath] = anchorEntry
  let [_, endPath] = focusEntry
  const ranges: DOMRange[] = []
  let isStart = true
  let next: NodeEntry<Element> | undefined = anchorEntry
  while (next) {
    const [nextBlock, nextPath] = next as NodeEntry<Element>
    const element = Editable.toDOMNode(editor, nextBlock)
    const rect = element.getBoundingClientRect()
    rectMap.set(rect, element)
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
  const lines = splitLines(rects)
  const lineRects: DOMRect[] = []
  let prevLineRect: DOMRect | null = null
  for (const [line, rects] of lines) {
    // 找到对应行所在的 element
    const blockRect = blockRects.find(
      r =>
        inLine(r, line) &&
        (line.left >= r.left || Math.abs(line.left - r.left) < 1) &&
        (line.right <= r.right || Math.abs(line.right - r.right) < 1),
    )
    const el = blockRect ? rectMap.get(blockRect) : null

    let width = line.right - line.left
    if (el) {
      const lineRect = matchHighest(editor, el, line.top, line.bottom)
      line.top = lineRect.top
      line.height = lineRect.height
      // 空节点的宽度给个最小值
      if (el && width < 1 && el.getBoundingClientRect().left === line.left) {
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
