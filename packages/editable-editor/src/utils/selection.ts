import { Editor, Node, Range, Element } from 'slate'
import { EditableEditor } from '../plugin/editable-editor';
import { DOMElement, DOMNode, isDOMElement, isDOMText } from './dom';

interface LineRect {
  top: number
  height: number
  bottom: number
}

const splitLines = (rects: DOMRectList) => {
  const lines: Map<LineRect, DOMRect[]> = new Map()
  if(rects.length === 0) return lines
  const lineKeys: LineRect[] = []
  const findKey = (rect: DOMRect) => {
    for(const lineKey of lineKeys) {
      const { top, bottom } = lineKey
      if(rect.top >= top && rect.bottom <= bottom || rect.top <= top && rect.bottom >= bottom) {
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
      const lineRect = { top: rect.top, height: rect.height, bottom: rect.bottom}
      lines.set(lineRect, [rect])
      lineKeys.push(lineRect)
    }
  }
  return lines
}

const getLineRect = (editor: EditableEditor, element: DOMElement, top: number, bottom: number) => {
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
        const node = hasNode ? EditableEditor.toSlateNode(editor, child) : null
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
          const display = window.getComputedStyle(child).display
          if(display === 'inline') {
            const rects = child.getClientRects()
            for(let r = 0; r < rects.length; r++) {
              const rect = rects[r]
              compareHeight(rect)
            }
          } else {
            findHeight(child)
          }
        }
      }
    }
  }
  
  findHeight(element)
  return lineReact
}

export const toDOMRects = (editor: EditableEditor, range: Range) => {
  const anchor = Range.start(range)
  const focus = Range.end(range)
  const anchorBlock = Editor.above<Element>(editor, {
    at: anchor,
    match: n => Editor.isBlock(editor, n),
    mode: 'highest'
  })
  const focusBlock = Editor.above<Element>(editor, {
    at: focus,
    match: n => Editor.isBlock(editor, n),
    mode: 'highest'
  })
  if(!anchorBlock || !focusBlock) return []

  const blockRects: DOMRect[] = []
  const rectMap: Map<DOMRect, DOMElement> = new Map()
  let anchorEl: HTMLElement | null = EditableEditor.toDOMNode(editor, anchorBlock[0])
  let focusEl: HTMLElement | null = EditableEditor.toDOMNode(editor, focusBlock[0])
  while(anchorEl) {
    const rect = anchorEl.getBoundingClientRect()
    rectMap.set(rect, anchorEl)
    blockRects.push(rect)
    if(anchorEl === focusEl) break
    const next: DOMNode | null = anchorEl.nextElementSibling
    if(isDOMElement(next)) anchorEl = next as HTMLElement
  }

  const domRange = EditableEditor.toDOMRange(editor, range)
  const lines = splitLines(domRange.getClientRects())
  const lineRects: DOMRect[] = []
  for(const [line, rects] of lines) {
    const blockRect = blockRects.find(r => r.top >= line.top && r.bottom <= line.bottom || r.top <= line.top && r.bottom >= line.bottom)
    if(blockRect) {
      const el = rectMap.get(blockRect)
      if(el) { 
        const lineRect = getLineRect(editor, el, line.top, line.bottom)
        line.top = lineRect.top
        line.height = lineRect.height
        line.bottom = lineRect.bottom
      }
    }
    let width = rects[rects.length - 1].right - rects[0].left
    if(width === 0) width = 4
    const lineRect = new DOMRect(rects[0].left, line.top, width, line.height)
    lineRects.push(lineRect)
  }
  return lineRects
}