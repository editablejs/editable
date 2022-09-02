import { Editor, Node, Range, Element, NodeEntry, Path } from 'slate'
import { Editable } from '../plugin/editable';
import { DOMElement, DOMNode, DOMRange, isDOMElement, isDOMText } from './dom';

interface LineRect {
  top: number
  height: number
  bottom: number
  left: number
  right: number
}

const splitLines = (rects: DOMRect[] | DOMRectList) => {
  const lines: Map<LineRect, DOMRect[]> = new Map()
  if(rects.length === 0) return lines
  const lineKeys: LineRect[] = []
  const findKey = (rect: DOMRect) => {
    for(const lineKey of lineKeys) {
      const { top, bottom, right } = lineKey
      const prevs = lines.get(lineKey)
      const last = prevs ? (prevs.concat().reverse().find(p => p.width > 0) ?? prevs[prevs.length - 1]) : null
      if((rect.top >= top && rect.bottom <= bottom || rect.top <= top && rect.bottom >= bottom) && rect.left <= (last ? last.right : right) + 1) {
        return lineKey
      }
    }
    return null
  }
  for(let r = 0; r < rects.length; r++) {
    const rect = rects[r]
    const key = findKey(rect)
    if(key) {
      lines.get(key)?.push(rect)
    } else {
      const lineRect = { top: rect.top, height: rect.height, bottom: rect.bottom, left: rect.left, right: rect.right }
      lines.set(lineRect, [rect])
      lineKeys.push(lineRect)
    }
  }
  return lines
}

/**
 * 找到top位置在el节点中所在行的最大位置
 * @param editor 
 * @param element 
 * @param top 
 * @param bottom 
 * @returns 
 */
const findMaxPosition = (editor: Editable, element: DOMElement, top: number, bottom: number) => {
  let height = bottom - top
  const lineReact = {
    top: top,
    height: height,
    bottom: bottom
  }

  const compareHeight = (rect: DOMRect) => { 
    if(rect.top >= top && rect.bottom <= bottom || rect.top <= top && rect.bottom >= bottom && rect.height > height) {
      if(rect.height > height) {
        lineReact.height = rect.height
        lineReact.top = rect.top
        lineReact.bottom = rect.bottom
      }
    }
  }

  const findHeight = (element: DOMElement) => { 
    for(const child of element.childNodes) {
      if(isDOMElement(child)) {
        const hasNode = child.hasAttribute('data-slate-node')
        const node = hasNode ? Editable.toSlateNode(editor, child) : null
        if(node) {
          if(Element.isElement(node)) {
            if(editor.isVoid(node)) {
              const rect = child.getBoundingClientRect()
              compareHeight(rect)
            } else if(editor.isInline(node)) {
              const rects = child.getClientRects()
              for(let r = 0; r < rects.length; r++) {
                const rect = rects[r]
                compareHeight(rect)
              }
            } else {
              findHeight(child)
            }
          } else {
            const nodes = child.querySelectorAll('[data-slate-string], [data-slate-composition], [data-slate-zero-width]')
            nodes.forEach(node => {
              const rects = node.getClientRects()
              for(let r = 0; r < rects.length; r++) {
                const rect = rects[r]
                compareHeight(rect)
              }
            })
          }
        } else {
          findHeight(child)
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
        //     findHeight(child)
        //   }
        // }
      }
    }
  }
  
  findHeight(element)
  return lineReact
}

export const getLineRectsByNode = (editor: Editable, node: Node, minWidth = 4) => { 
  const path = Editable.findPath(editor, node)
  const block: NodeEntry | undefined = Editor.isBlock(editor, node) && path.length === 1 ? [node, path] : Editor.above<Element>(editor, {
    at: path,
    match: n => Editor.isBlock(editor, n),
    mode: 'highest'
  })
  if(!block) return []
  const domEl = Editable.toDOMNode(editor, block[0])
  const domRect = domEl.getBoundingClientRect()
  const range = document.createRange()
  range.selectNodeContents(Editable.toDOMNode(editor, node))
  const lines = splitLines(range.getClientRects())
  const lineRects: DOMRect[] = []
  for(const [line, rects] of lines) {
    // 一行的最后rect的right 减去第一个rect的left 行得到宽度
    const last = rects.concat().reverse().find(r => r.width > 0) ?? rects[rects.length - 1]
    let width = last.right - rects[0].left
    const lineRect = findMaxPosition(editor, domEl, line.top, line.bottom)
    line.top = lineRect.top
    line.height = lineRect.height
    line.bottom = lineRect.bottom
    // 空节点的宽度给个最小值
    if(width < 1 && domRect.left === rects[0].left) {
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
export const getLineRectsByRange = (editor: Editable, range: Range, minWidth = 4) => {
  const anchor = Range.start(range)
  const focus = Range.end(range)
  // 开始位置的 block节点
  const anchorEntry = Editor.above<Element>(editor, {
    at: anchor,
    match: n => Editor.isBlock(editor, n),
    mode: 'lowest'
  })
  // 结束位置的 block 节点
  const focusEntry = Editor.above<Element>(editor, {
    at: focus,
    match: n => Editor.isBlock(editor, n),
    mode: 'lowest'
  })
  if(!anchorEntry || !focusEntry) return []

  const blockRects: DOMRect[] = []
  const rectMap: Map<DOMRect, DOMElement> = new Map()

  let [startBlock, startPath] = anchorEntry
  let [_, endPath] = focusEntry
  const ranges: DOMRange[] = []
  let isStart = true
  let next: NodeEntry<Element> | undefined = anchorEntry
  while(next) {
    const [nextBlock, nextPath] = next as NodeEntry<Element>
    const element = Editable.toDOMNode(editor, nextBlock)
    const rect = element.getBoundingClientRect()
    rectMap.set(rect, element)
    blockRects.push(rect)
   
    if(Path.equals(nextPath, endPath)) break
    if(!isStart) {
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
  if(Path.equals(startPath, endPath)) {
    ranges.unshift(Editable.toDOMRange(editor, range))
  } else {
    ranges.unshift(Editable.toDOMRange(editor, {
      anchor,
      focus: Editable.toLowestPoint(editor, {
        path: startPath,
        offset: startBlock.children.length
      }, 'end')
    }))
    ranges.push(Editable.toDOMRange(editor, {
      anchor: Editable.toLowestPoint(editor, {
        path: endPath,
        offset: 0
      }),
      focus
    }))
  }
  
  // 拆分的行
  const rects: DOMRect[] = []
  for(const range of ranges) { 
    rects.push(...range.getClientRects())
  }
  const lines = splitLines(rects)
  const lineRects: DOMRect[] = []
  for(const [line, rects] of lines) {
    // 找到对应行所在的 element
    const blockRect = blockRects.find(r => (r.top >= line.top && r.bottom <= line.bottom || r.top <= line.top && r.bottom >= line.bottom) && line.left >= r.left && line.right <= r.right)
    const el = blockRect ? rectMap.get(blockRect) : null
    // 一行的最后rect的right 减去第一个rect的left 行得到宽度
    const last = rects.concat().reverse().find(r => r.width > 0) ?? rects[rects.length - 1]
    let width = last.right - rects[0].left
    if(el) { 
      const lineRect = findMaxPosition(editor, el, line.top, line.bottom)
      line.top = lineRect.top
      line.height = lineRect.height
      line.bottom = lineRect.bottom
      // 空节点的宽度给个最小值
      if(width < 1 && el.getBoundingClientRect().left === rects[0].left) {
        width = minWidth
      }
    }
    const lineRect = new DOMRect(rects[0].left, line.top, width, line.height)
    lineRects.push(lineRect)
  }
  return lineRects
}

export const getRectsByRange = (editor: Editable, range: Range) => {
  let rects: DOMRect[] = []
  if (Range.isCollapsed(range)) { 
    const domRange = Editable.toDOMRange(editor, range)
    rects = [domRange.getBoundingClientRect()]
  } else {
    rects = getLineRectsByRange(editor, range)
  }
  return rects
}