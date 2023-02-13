import {
  Editor,
  Node,
  Text,
  Element,
  Path,
  Point,
  Range,
  Scrubber,
  Transforms,
  SelectionEdge,
  Key,
  DOMElement,
  DOMNode,
  DOMPoint,
  DOMRange,
  DOMSelection,
  DOMStaticRange,
  isDOMElement,
  isDOMSelection,
  isDOMNode,
  isDOMText,
} from '@editablejs/models'

import {
  EDITOR_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_INDEX,
  NODE_TO_KEY,
  NODE_TO_PARENT,
  EDITOR_TO_WINDOW,
  EDITOR_TO_KEY_TO_ELEMENT,
  IS_COMPOSING,
  NODE_TO_ELEMENT,
} from '../utils/weak-maps'
import { normalizeDOMPoint, hasShadowRoot } from '../utils/dom'
import { IS_CHROME, IS_FIREFOX } from '../utils/environment'
import findNearbyNodes, { isAlignY } from '../utils/nearby'
import { getTextOffset } from '../utils/text'
import { getLineRectsByNode, getLineRectsByRange } from '../utils/selection'
import { Focused } from '../hooks/use-focused'
import { EventHandler, EventType } from './event'
import {
  DATA_EDITABLE_COMPOSITION,
  DATA_EDITABLE_INLINE,
  DATA_EDITABLE_LEAF,
  DATA_EDITABLE_LENGTH,
  DATA_EDITABLE_NODE,
  DATA_EDITABLE_PLACEHOLDER,
  DATA_EDITABLE_STRING,
  DATA_EDITABLE_VOID,
  DATA_EDITABLE_ZERO_WIDTH,
} from '../utils/constants'
import { getNativeEvent, isTouch } from '../utils/event'
import { ReadOnly } from '../hooks/use-read-only'

export type BaseAttributes = Omit<React.HTMLAttributes<HTMLElement>, 'children'>

export interface ElementAttributes<T extends any = any> extends BaseAttributes {
  [DATA_EDITABLE_NODE]: 'element'
  [DATA_EDITABLE_INLINE]?: true
  [DATA_EDITABLE_VOID]?: true
  dir?: 'rtl'
  ref: React.MutableRefObject<T>
}

export interface TextAttributes extends BaseAttributes {
  [DATA_EDITABLE_LEAF]?: true
}

export type NodeAttributes = ElementAttributes | TextAttributes

export interface PlaceholderAttributes extends BaseAttributes {
  [DATA_EDITABLE_PLACEHOLDER]: true
}

export interface RenderElementAttributes<T extends Element = Element> {
  element: T
  attributes: ElementAttributes
}

export interface RenderLeafAttributes<T extends Text = Text> {
  text: T
  attributes: TextAttributes
}

/**
 * `RenderElementProps` are passed to the `renderElement` handler.
 */
export interface RenderElementProps<T extends Element = Element, R extends any = any> {
  children: any
  element: T
  attributes: ElementAttributes<R>
}

/**
 * `RenderLeafProps` are passed to the `renderLeaf` handler.
 */
export interface RenderLeafProps<T extends Text = Text> {
  children: any
  text: T
  attributes: TextAttributes
}

export interface RenderPlaceholderProps<T extends Node = Node> {
  children: any
  attributes: PlaceholderAttributes
  node: T
}

export interface SerializeHtmlOptions {
  node: Node
  attributes?: Record<string, any>
  styles?: Record<string, any>
}

export interface DeserializeHtmlOptions {
  node: DOMNode
  attributes?: Record<string, any>
  markAttributes?: Record<string, any>
  stripBreak?: true | ((text: string) => boolean)
}

export interface SelectWordOptions {
  at?: Range
  edge?: SelectionEdge
}

/**
 * A React and DOM-specific version of the `Editor` interface.
 */
export interface Editable extends Editor {
  blur(): void
  focus(start?: boolean): void
  copy(range?: Range): void
  cut(range?: Range): void
  selectWord: (options?: SelectWordOptions) => void
  selectLine: (options?: SelectWordOptions) => void
  insertFromClipboard(at?: Range): void
  insertTextFromClipboard(at?: Range): void
  insertFile(file: File, at?: Range): void
  on: <T extends EventType>(type: T, handler: EventHandler<T>, prepend?: boolean) => void
  once: <T extends EventType>(type: T, handler: EventHandler<T>, prepend?: boolean) => void
  off: <T extends EventType>(type: T, handler: EventHandler<T>) => void
  emit: <T extends EventType>(type: T, ...args: Parameters<EventHandler<T>>) => void
  onKeydown: (event: KeyboardEvent) => void
  onKeyup: (event: KeyboardEvent) => void
  onFocus: () => void
  onBlur: () => void
  onPaste: (event: ClipboardEvent) => void
  onCut: (event: ClipboardEvent) => void
  onCopy: (event: ClipboardEvent) => void
  onInput: (value: string) => void
  onBeforeInput: (value: string) => void
  onCompositionStart: (value: string) => void
  onCompositionEnd: (value: string) => void
  onSelectStart: () => void
  onSelecting: () => void
  onSelectEnd: () => void
  onSelectionChange: () => void
  onTouchHold: (event: TouchEvent) => void
  onContextMenu: (event: MouseEvent) => void
  onDestory: () => void
  renderElementAttributes: (props: RenderElementAttributes) => ElementAttributes
  renderLeafAttributes: (props: RenderLeafAttributes) => TextAttributes
  renderElement: (props: RenderElementProps) => JSX.Element
  renderLeaf: (props: RenderLeafProps) => JSX.Element
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element | void | null
  toDataTransfer: (range?: Range) => DataTransfer | null
}

export const Editable = {
  isEditor(value: any): value is Editable {
    return !!value && Editor.isEditor(value) && 'onSelectionChange' in value
  },
  /**
   * Check if the user is currently composing inside the editor.
   */
  isComposing(editor: Editor): boolean {
    return !!IS_COMPOSING.get(editor)
  },

  /**
   * 获取在选区内选中一行内容的节点以及所在行的索引
   * @param editor
   * @param options
   * @returns
   */
  getSelectLine(
    editor: Editor,
    options: { range?: Range; match?: (element: Element) => boolean } = {},
  ): [Element, number] | undefined {
    const { range = editor.selection, match = () => true } = options
    if (!range || Range.isCollapsed(range)) return
    const start = Range.start(range)
    const entry = Editor.above(editor, { at: start, match: n => Editor.isBlock(editor, n) })
    if (!entry) return
    const rangeLines = getLineRectsByRange(editor, range)
    let [block, path] = entry
    while (block) {
      if (match(block)) {
        const elLines = getLineRectsByNode(editor, block)
        for (const rangeLine of rangeLines) {
          const index = elLines.findIndex(
            elLine =>
              elLine.left === rangeLine.left &&
              elLine.top === rangeLine.top &&
              elLine.width === rangeLine.width,
          )
          if (~index) {
            return [block, index]
          }
        }
      }
      const next = Editor.next(editor, { at: path, match: n => Editor.isBlock(editor, n) })
      if (!next) return
      const [n, p] = next
      block = n as Element
      path = p
    }
    return
  },
  /**
   * 检查选区是否选中在内容一行的开始或者结尾
   * @param editor
   * @param options
   * @returns
   */
  isSelectLineEdge(editor: Editor, options: { point?: Point; edge?: SelectionEdge } = {}): boolean {
    const { point = editor.selection?.focus, edge = 'start' } = options
    if (!point) return false
    const entry = Editor.above(editor, { at: point, match: n => Editor.isBlock(editor, n) })
    if (!entry) return false
    const [block] = entry
    const rangeLines = getLineRectsByRange(editor, { anchor: point, focus: point })
    if (rangeLines.length === 0) return false
    const rangeLine = rangeLines[0]
    const lines = getLineRectsByNode(editor, block)
    for (const line of lines) {
      if (
        ~['start', 'anchor'].indexOf(edge) &&
        line.left === rangeLine.left &&
        line.top === rangeLine.top
      ) {
        return true
      } else if (
        ~['end', 'focus'].indexOf(edge) &&
        line.right === rangeLine.right &&
        line.top === rangeLine.top
      ) {
        return true
      }
    }
    return false
  },

  /**
   * Return the host window of the current editor.
   */
  getWindow(editor: Editor): Window {
    const window = EDITOR_TO_WINDOW.get(editor)
    if (!window) {
      throw new Error('Unable to find a host window element for this editor')
    }
    return window
  },

  /**
   * Find a key for a Slate node.
   */

  findKey(editor: Editor, node: Node): Key {
    let key = NODE_TO_KEY.get(node)

    if (!key) {
      key = new Key()
      NODE_TO_KEY.set(node, key)
    }

    return key
  },

  /**
   * Find the path of Slate node.
   */

  findPath(editor: Editor, node: Node): Path {
    const path: Path = []
    let child = node

    while (true) {
      const parent = NODE_TO_PARENT.get(child)

      if (parent == null) {
        if (Editor.isEditor(child)) {
          return path
        } else {
          break
        }
      }

      const i = NODE_TO_INDEX.get(child)

      if (i == null) {
        break
      }

      path.unshift(i)
      child = parent
    }

    throw new Error(`Unable to find the path for Slate node: ${Scrubber.stringify(node)}`)
  },

  /**
   * Find the DOM node that implements DocumentOrShadowRoot for the editor.
   */

  findDocumentOrShadowRoot(editor: Editor): Document | ShadowRoot {
    const el = Editable.toDOMNode(editor, editor)
    const root = el.getRootNode()

    if (
      (root instanceof Document || root instanceof ShadowRoot) &&
      (root as any).getSelection != null
    ) {
      return root
    }

    return el.ownerDocument
  },

  /**
   * Check if the editor is focused.
   */
  isFocused(editor: Editor): boolean {
    return Focused.is(editor)
  },

  /**
   * Check if the editor is in read-only mode.
   */

  isReadOnly(editor: Editor): boolean {
    return ReadOnly.is(editor)
  },

  /**
   * Blur the editor.
   */

  blur(editor: Editable): void {
    editor.blur()
  },

  /**
   * Focus the editor.
   */
  focus(editor: Editable): void {
    editor.focus()
  },

  deselect(editor: Editor): void {
    const { selection } = editor
    if (selection) {
      Transforms.deselect(editor)
    }
  },

  /**
   * Check if a DOM node is within the editor.
   */
  hasDOMNode(editor: Editor, target: DOMNode): boolean {
    const editorEl = Editable.toDOMNode(editor, editor)
    let targetEl

    // COMPAT: In Firefox, reading `target.nodeType` will throw an error if
    // target is originating from an internal "restricted" element (e.g. a
    // stepper arrow on a number input). (2018/05/04)
    // https://github.com/ianstormtaylor/slate/issues/1819
    try {
      targetEl = (isDOMElement(target) ? target : target.parentElement) as HTMLElement
    } catch (err: any) {
      if (!err.message.includes('Permission denied to access property "nodeType"')) {
        throw err
      }
    }

    if (!targetEl) {
      return false
    }

    return targetEl.closest(`[${DATA_EDITABLE_NODE}="editor"]`) === editorEl
  },

  /**
   * Find the native DOM element from a Slate node.
   */

  toDOMNode(editor: Editor, node: Node): HTMLElement {
    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
    const offsetNode = Editor.isEditor(node)
      ? EDITOR_TO_ELEMENT.get(editor)
      : KEY_TO_ELEMENT?.get(Editable.findKey(editor, node))

    if (!offsetNode) {
      throw new Error(`Cannot resolve a DOM node from Slate node: ${Scrubber.stringify(node)}`)
    }

    return offsetNode
  },

  /**
   * Find a native DOM selection point from a Slate point.
   */
  toDOMPoint(editor: Editor, point: Point): DOMPoint {
    const [node] = Editor.node(editor, point.path)
    const el = Editable.toDOMNode(editor, node)
    let domPoint: DOMPoint | undefined

    // If we're inside a void node, force the offset to 0, otherwise the zero
    // width spacing character will result in an incorrect offset of 1
    if (Editor.void(editor, { at: point })) {
      point = { path: point.path, offset: 0 }
    }

    // For each leaf, we need to isolate its content, which means filtering
    // to its direct text and zero-width spans. (We have to filter out any
    // other siblings that may have been rendered alongside them.)
    const selector = `[${DATA_EDITABLE_STRING}], [${DATA_EDITABLE_COMPOSITION}], [${DATA_EDITABLE_ZERO_WIDTH}]`
    const texts = Array.from(el.querySelectorAll(selector))
    let start = 0

    for (const text of texts) {
      const offsetNode = text.childNodes[0] as HTMLElement

      if (offsetNode == null || offsetNode.textContent == null) {
        continue
      }

      const { length } = offsetNode.textContent
      const attr = text.getAttribute(DATA_EDITABLE_LENGTH)
      const trueLength = attr == null ? length : parseInt(attr, 10)
      const end = start + trueLength

      if (point.offset <= end) {
        const offset = Math.min(length, Math.max(0, point.offset - start))
        domPoint = [offsetNode, offset]
        break
      }

      start = end
    }

    if (!domPoint) {
      throw new Error(`Cannot resolve a DOM point from Slate point: ${Scrubber.stringify(point)}`)
    }

    return domPoint
  },

  /**
   * Find a native DOM range from a Slate `range`.
   *
   * Notice: the returned range will always be ordinal regardless of the direction of Slate `range` due to DOM API limit.
   *
   * there is no way to create a reverse DOM Range using Range.setStart/setEnd
   * according to https://dom.spec.whatwg.org/#concept-range-bp-set.
   */

  toDOMRange(editor: Editor, range: Range): DOMRange {
    const { anchor, focus } = range
    const isBackward = Range.isBackward(range)
    const domAnchor = Editable.toDOMPoint(editor, anchor)
    const domFocus = Range.isCollapsed(range) ? domAnchor : Editable.toDOMPoint(editor, focus)

    const window = Editable.getWindow(editor)
    const domRange = window.document.createRange()
    const [startNode, startOffset] = isBackward ? domFocus : domAnchor
    const [endNode, endOffset] = isBackward ? domAnchor : domFocus

    // A slate Point at zero-width Leaf always has an offset of 0 but a native DOM selection at
    // zero-width node has an offset of 1 so we have to check if we are in a zero-width node and
    // adjust the offset accordingly.
    const startEl = (isDOMElement(startNode) ? startNode : startNode.parentElement) as HTMLElement
    const isStartAtZeroWidth = !!startEl.getAttribute(DATA_EDITABLE_ZERO_WIDTH)
    const endEl = (isDOMElement(endNode) ? endNode : endNode.parentElement) as HTMLElement
    const isEndAtZeroWidth = !!endEl.getAttribute(DATA_EDITABLE_ZERO_WIDTH)

    domRange.setStart(startNode, isStartAtZeroWidth ? 1 : startOffset)
    domRange.setEnd(endNode, isEndAtZeroWidth ? 1 : endOffset)
    return domRange
  },

  /**
   * Find a Slate node from a native DOM `element`.
   */

  toSlateNode(editor: Editor, offsetNode: DOMNode): Node {
    let domEl = isDOMElement(offsetNode) ? offsetNode : offsetNode.parentElement

    if (domEl && !domEl.hasAttribute(DATA_EDITABLE_NODE)) {
      domEl = domEl.closest(`[${DATA_EDITABLE_NODE}]`)
    }

    const node = domEl ? ELEMENT_TO_NODE.get(domEl as HTMLElement) : null

    if (!node) {
      throw new Error(`Cannot resolve a Slate node from DOM node: ${domEl}`)
    }

    return node
  },

  findLowestDOMElements(editor: Editor, node: Node) {
    const domNode = Editable.toDOMNode(editor, node)
    if (Editor.isVoid(editor, node)) return [domNode]
    const nodes = domNode.querySelectorAll(
      `[${DATA_EDITABLE_STRING}], [${DATA_EDITABLE_COMPOSITION}], [${DATA_EDITABLE_ZERO_WIDTH}]`,
    )
    return Array.from(nodes)
  },

  findClosestPoint(editor: Editor, domNode: DOMNode, x: number, y: number): Point | null {
    const domEl = isDOMElement(domNode) ? domNode : domNode.parentElement
    if (!domEl) return null
    const elements: DOMElement[] = []
    let element: DOMElement | null = domEl.hasAttribute(DATA_EDITABLE_NODE)
      ? domEl
      : domEl.closest(`[${DATA_EDITABLE_NODE}]`)

    const addToElements = (node: Node) => {
      if (!NODE_TO_ELEMENT.get(node)) return
      const children = Editable.findLowestDOMElements(editor, node)
      for (const child of children) {
        if (~elements.indexOf(child)) continue
        elements.push(child)
      }
    }

    if (!element) {
      const nodes = Node.nodes(editor)
      for (const [node] of nodes) {
        addToElements(node)
      }
    } else {
      const node = Editable.toSlateNode(editor, element)
      if (Text.isText(node) || Editor.isVoid(editor, node)) {
        addToElements(node)
      } else {
        if (!Editor.isSolidVoid(editor, node)) {
          const rect = element.getBoundingClientRect()
          const reverse = x < rect.left + rect.width / 2
          const adjacent = (reverse ? Editor.previous : Editor.next)(editor, {
            at: Editable.findPath(editor, node),
          })
          if (adjacent) {
            addToElements(adjacent[0])
          }
        } else {
          const isGrid = Editor.isGrid(editor, node)
          const nodes = Editor.nodes(editor, {
            at: Editable.findPath(editor, node),
            match: n => (isGrid && Editor.isGridCell(editor, n)) || Text.isText(n),
            mode: 'highest',
          })
          for (const [child] of nodes) {
            if (Editor.isBlock(editor, child)) {
              elements.push(Editable.toDOMNode(editor, child))
            } else addToElements(child)
          }
        }
      }
    }
    let top = y,
      left = x
    const nodes = findNearbyNodes(elements, x, y)
    if (!nodes) return null
    let offsetNode: DOMElement | null = null
    if (isDOMNode(nodes)) {
      offsetNode = nodes
    } else {
      const { top: nearbyTop, left: nearbyLeft, right: nearbyRight, below: nearbyBelow } = nodes

      if (nearbyLeft && nearbyBelow) {
        if (isAlignY(nearbyBelow.rect, nearbyLeft.rect)) {
          offsetNode = nearbyBelow.node
          top = nearbyBelow.rect.top
        } else {
          offsetNode = nearbyLeft.node
          left = nearbyLeft.rect.right
        }
      } else if (nearbyRight && nearbyBelow) {
        if (isAlignY(nearbyBelow.rect, nearbyRight.rect)) {
          offsetNode = nearbyBelow.node
          top = nearbyBelow.rect.top
        } else {
          offsetNode = nearbyRight.node
          left = nearbyRight.rect.left
        }
      } else if (nearbyLeft) {
        offsetNode = nearbyLeft.node
        if (left <= nearbyLeft.rect.left) left = nearbyLeft.rect.left
        else if (left >= nearbyLeft.rect.right) left = nearbyLeft.rect.right
        else {
          top = nearbyLeft.rect.top
        }
      } else if (nearbyRight) {
        offsetNode = nearbyRight.node
        if (left <= nearbyRight.rect.left) left = nearbyRight.rect.left
        else if (left >= nearbyRight.rect.right) left = nearbyRight.rect.right
        else {
          top = nearbyRight.rect.top
        }
      } else if (nearbyBelow) {
        if (left < nearbyBelow.rect.left) {
          left = nearbyBelow.rect.left
        } else if (left > nearbyBelow.rect.right) {
          left = nearbyBelow.rect.right
        }
        top = nearbyBelow.rect.top
        offsetNode = nearbyBelow.node
      } else if (nearbyTop) {
        offsetNode = nearbyTop.node
        if (left < nearbyTop.rect.left) {
          left = nearbyTop.rect.left
        } else if (left > nearbyTop.rect.right) {
          left = nearbyTop.rect.right
        }
        top = nearbyTop.rect.bottom
      }
    }
    if (!offsetNode) return null
    const node = Editable.toSlateNode(editor, offsetNode)
    if (Text.isText(node)) {
      const path = Editable.findPath(editor, node)
      if (node.text.length === 0) {
        return {
          path,
          offset: 0,
        }
      }
      const textNodes = Editable.findLowestDOMElements(editor, node)
      let startOffset = 0
      for (let s = 0; s < textNodes.length; s++) {
        const textNode = textNodes[s]
        if (textNode === offsetNode) break
        startOffset += (textNode.textContent ?? '').length
      }
      const textNode = isDOMText(offsetNode) ? offsetNode : offsetNode.firstChild
      if (!isDOMText(textNode)) return null
      const content = textNode.textContent ?? ''
      const offset = getTextOffset(textNode, left, top, 0, content.length, content.length)
      return {
        path,
        offset: startOffset + offset,
      }
    } else if (Element.isElement(node)) {
      const point = Editable.toSlatePoint(editor, [offsetNode, 0], {
        exactMatch: false,
        suppressThrow: true,
      })
      if (!point) return Editor.start(editor, Editable.findPath(editor, node))
      return point
    }
    return null
  },
  /**
   * Get the target point from a DOM `event`.
   */
  findEventPoint(editor: Editor, event: any): Point | null {
    event = getNativeEvent(event)
    const { clientX: x, clientY: y } = event

    if (x == null || y == null) {
      throw new Error(`Cannot resolve a Slate range from a DOM event: ${event}`)
    }
    let target = event.target
    if (isTouch(event)) {
      target = document.elementFromPoint(event.clientX, event.clientY)
    }
    return Editable.findClosestPoint(editor, target, x, y)
  },

  findPreviousLinePoint(editor: Editor, at?: Range): Point | null {
    const { selection } = editor
    if (!at && selection) at = selection
    if (!at) return null
    const startPoint = Range.start(at)
    const endPoint = Range.end(at)
    const startRange = Editable.toDOMRange(editor, { anchor: startPoint, focus: startPoint })
    const endRange = Editable.toDOMRange(editor, { anchor: endPoint, focus: endPoint })

    const startRects = startRange.getClientRects()
    const endRects = endRange.getClientRects()

    const block = Editor.above(editor, {
      at: at.focus,
      match: n => Editor.isBlock(editor, n),
    })
    let top = endRects[0].top
    let isFind = false

    let isSameLine = true

    let prevBlock = block
    let domBlock: DOMElement | null = null
    while (prevBlock && !isFind) {
      const [block, path] = prevBlock
      domBlock = Editable.toDOMNode(editor, block)
      const lowestElements = Editable.findLowestDOMElements(editor, block)
      for (let l = lowestElements.length - 1; l >= 0 && !isFind; l--) {
        const lowestElement = lowestElements[l]
        const rects = lowestElement.getClientRects()
        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i]
          if (rect.height === 0) continue
          if (rect.bottom <= top) {
            isFind = true
            top = rect.bottom - rect.height / 2
            break
          }
        }
      }
      if (!isFind) {
        isSameLine = false
        prevBlock = Editor.previous(editor, {
          at: path,
          match: n => Editor.isBlock(editor, n),
        })
      }
    }
    if (!domBlock) return null
    return Editable.findClosestPoint(
      editor,
      domBlock,
      isFind && !isSameLine ? startRects[0].x : 0,
      top,
    )
  },

  findLineEdgePoint(
    editor: Editor,
    { at, edge = 'start' }: { at?: Range; edge?: 'start' | 'end' } = {},
  ): Point | null {
    const { selection } = editor
    if (!at && selection) at = selection
    if (!at) return null
    const isStart = edge === 'start'
    const point = isStart ? Range.start(at) : Range.end(at)
    const range = Editable.toDOMRange(editor, {
      anchor: point,
      focus: point,
    })
    range.collapse(isStart)
    const rects = range.getClientRects()
    const rect = rects[rects.length - 1]
    const bottom = rect.top + rect.height / 2
    const block = Editor.above(editor, {
      at: point,
      match: n => Editor.isBlock(editor, n),
    })
    if (!block) return null
    const domBlock = Editable.toDOMNode(editor, block[0])
    return Editable.findClosestPoint(editor, domBlock, isStart ? -99999 : 99999, bottom)
  },

  findNextLinePoint(editor: Editor, at?: Range): Point | null {
    const { selection } = editor
    if (!at && selection) at = selection
    if (!at) return null
    const startPoint = Range.start(at)
    const endPoint = Range.end(at)
    const startRange = Editable.toDOMRange(editor, { anchor: startPoint, focus: startPoint })
    const endRange = Editable.toDOMRange(editor, { anchor: endPoint, focus: endPoint })

    const startRects = startRange.getClientRects()
    const endRects = endRange.getClientRects()

    let blockEntry = Editor.above(editor, {
      at: at.focus,
      match: n => Editor.isBlock(editor, n),
    })
    let bottom = endRects[0].bottom
    let isFind = false
    let isSameLine = true
    let domBlock: DOMElement | null = null
    while (blockEntry && !isFind) {
      const [block, path] = blockEntry
      domBlock = Editable.toDOMNode(editor, block)
      const lowestElements = Editable.findLowestDOMElements(editor, block)
      for (let l = 0; l < lowestElements.length && !isFind; l++) {
        const lowestElement = lowestElements[l]
        const rects = lowestElement.getClientRects()
        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i]
          if (rect.height === 0) continue
          if (rect.top >= bottom) {
            isFind = true
            bottom = rect.top + rect.height / 2
            break
          }
        }
      }
      if (!isFind) {
        blockEntry = Editor.next(editor, {
          at: path,
          match: n => Editor.isBlock(editor, n),
        })
        isSameLine = false
      }
    }
    if (!domBlock) return null

    return Editable.findClosestPoint(
      editor,
      domBlock,
      isFind && !isSameLine ? startRects[0].x : 99999,
      bottom,
    )
  },

  findTextOffsetOnLine(editor: Editor, point: Point) {
    const blockEntry = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
      at: point,
    })
    const data = {
      text: '',
      offset: 0,
    }
    if (!blockEntry) {
      throw new Error(`Cannot resolve a Slate block from a point: ${point}`)
    }
    const textNodes = Node.texts(blockEntry[0])
    let isFindOffset = false
    for (const [textNode, textPath] of textNodes) {
      let { text } = textNode
      const path = blockEntry[1].concat(textPath)
      const [parent] = Editor.parent(editor, path)
      if (parent && Editor.isVoid(editor, parent)) {
        text = ''
      }
      if (Path.equals(path, point.path)) {
        data.offset += point.offset
        isFindOffset = true
      } else if (!isFindOffset) {
        data.offset += text.length
      }
      data.text += text
    }
    return data
  },

  findPointOnLine(editor: Editor, path: Path, offset: number, moveNext: boolean = false) {
    const blockEntry = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
      at: path,
    })
    if (!blockEntry) {
      throw new Error(`Cannot resolve a Slate block from a path: ${path}`)
    }
    const textNodes = Node.texts(blockEntry[0])
    let findOffset = 0
    for (const [textNode, textPath] of textNodes) {
      let { text } = textNode
      const path = blockEntry[1].concat(textPath)
      const [parent, parentPath] = Editor.parent(editor, path)
      const isVoid = parent && Editor.isVoid(editor, parent)
      if (isVoid) {
        text = ' '
      }
      const textLength = text.length
      const totalOffset = findOffset + textLength
      if (totalOffset >= offset) {
        if (moveNext && offset > 0 && totalOffset === offset) {
          const next = Editor.next(editor, {
            at: isVoid ? parentPath : path,
          })
          if (next) {
            return {
              path: next[1],
              offset: 0,
            }
          }
        }
        return { path, offset: textLength - (totalOffset - offset) }
      } else {
        findOffset += textLength
      }
    }
    return { path, offset }
  },

  /**
   * Find a Slate point from a DOM selection's `offsetNode` and `domOffset`.
   */

  toSlatePoint<T extends boolean>(
    editor: Editor,
    domPoint: DOMPoint,
    options: {
      exactMatch: T
      suppressThrow: T
    },
  ): T extends true ? Point | null : Point {
    const { exactMatch, suppressThrow } = options
    const [nearestNode, nearestOffset] = exactMatch ? domPoint : normalizeDOMPoint(domPoint)
    const parentNode = nearestNode.parentNode as DOMElement
    let textNode: DOMElement | null = null
    let offset = 0

    if (parentNode) {
      const editorEl = Editable.toDOMNode(editor, editor)
      const potentialVoidNode = parentNode.closest(`[${DATA_EDITABLE_VOID}]`)
      // Need to ensure that the closest void node is actually a void node
      // within this editor, and not a void node within some parent editor. This can happen
      // if this editor is within a void node of another editor ("nested editors", like in
      // the "Editable Voids" example on the docs site).
      const voidNode =
        potentialVoidNode && editorEl.contains(potentialVoidNode) ? potentialVoidNode : null
      let leafNode = parentNode.closest(`[${DATA_EDITABLE_LEAF}]`)
      let offsetNode: DOMElement | null = null

      // Calculate how far into the text node the `nearestNode` is, so that we
      // can determine what the offset relative to the text node is.
      if (leafNode) {
        textNode = leafNode.closest(`[${DATA_EDITABLE_NODE}="text"]`)

        if (textNode) {
          const window = Editable.getWindow(editor)
          const range = window.document.createRange()
          range.setStart(textNode, 0)
          range.setEnd(nearestNode, nearestOffset)

          const contents = range.cloneContents()
          const removals = [
            ...Array.prototype.slice.call(
              contents.querySelectorAll(`[${DATA_EDITABLE_ZERO_WIDTH}]`),
            ),
          ]

          removals.forEach(el => {
            el!.parentNode!.removeChild(el)
          })

          // COMPAT: Edge has a bug where Range.prototype.toString() will
          // convert \n into \r\n. The bug causes a loop when slate-react
          // attempts to reposition its cursor to match the native position. Use
          // textContent.length instead.
          // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10291116/
          offset = contents.textContent!.length
          offsetNode = textNode
        }
      } else if (voidNode) {
        // For void nodes, the element with the offset key will be a cousin, not an
        // ancestor, so find it by going down from the nearest void parent.
        leafNode = voidNode.querySelector(`[${DATA_EDITABLE_LEAF}]`)!

        // COMPAT: In read-only editors the leaf is not rendered.
        if (!leafNode) {
          offset = 1
        } else {
          textNode = leafNode.closest(`[${DATA_EDITABLE_NODE}="text"]`)!
          offsetNode = leafNode
          offset = offsetNode.textContent!.length
          offsetNode.querySelectorAll(`[${DATA_EDITABLE_ZERO_WIDTH}]`).forEach(el => {
            offset -= el.textContent!.length
          })
        }
      }

      if (
        offsetNode &&
        offset === offsetNode.textContent!.length &&
        // COMPAT: If the parent node is a Slate zero-width space, editor is
        // because the text node should have no characters. However, during IME
        // composition the ASCII characters will be prepended to the zero-width
        // space, so subtract 1 from the offset to account for the zero-width
        // space character.
        (parentNode.hasAttribute(DATA_EDITABLE_ZERO_WIDTH) ||
          // COMPAT: In Firefox, `range.cloneContents()` returns an extra trailing '\n'
          // when the document ends with a new-line character. This results in the offset
          // length being off by one, so we need to subtract one to account for this.
          (IS_FIREFOX && offsetNode.textContent?.endsWith('\n\n')))
      ) {
        offset--
      }
    }

    if (!textNode) {
      if (suppressThrow) {
        return null as T extends true ? Point | null : Point
      }
      throw new Error(`Cannot resolve a Slate point from DOM point: ${domPoint}`)
    }

    // COMPAT: If someone is clicking from one Slate editor into another,
    // the select event fires twice, once for the old editor's `element`
    // first, and then afterwards for the correct `element`. (2017/03/03)
    const slateNode = Editable.toSlateNode(editor, textNode!)
    const path = Editable.findPath(editor, slateNode)
    return { path, offset } as T extends true ? Point | null : Point
  },

  /**
   * Find a Slate range from a DOM range or selection.
   */

  toSlateRange<T extends boolean>(
    editor: Editor,
    domRange: DOMRange | DOMStaticRange | DOMSelection,
    options: {
      exactMatch: T
      suppressThrow: T
    },
  ): T extends true ? Range | null : Range {
    const { exactMatch, suppressThrow } = options
    const el = isDOMSelection(domRange) ? domRange.anchorNode : domRange.startContainer
    let anchorNode
    let anchorOffset
    let focusNode
    let focusOffset
    let isCollapsed

    if (el) {
      if (isDOMSelection(domRange)) {
        anchorNode = domRange.anchorNode
        anchorOffset = domRange.anchorOffset
        focusNode = domRange.focusNode
        focusOffset = domRange.focusOffset
        // COMPAT: There's a bug in chrome that always returns `true` for
        // `isCollapsed` for a Selection that comes from a ShadowRoot.
        // (2020/08/08)
        // https://bugs.chromium.org/p/chromium/issues/detail?id=447523
        if (IS_CHROME && hasShadowRoot()) {
          isCollapsed =
            domRange.anchorNode === domRange.focusNode &&
            domRange.anchorOffset === domRange.focusOffset
        } else {
          isCollapsed = domRange.isCollapsed
        }
      } else {
        anchorNode = domRange.startContainer
        anchorOffset = domRange.startOffset
        focusNode = domRange.endContainer
        focusOffset = domRange.endOffset
        isCollapsed = domRange.collapsed
      }
    }

    if (anchorNode == null || focusNode == null || anchorOffset == null || focusOffset == null) {
      throw new Error(`Cannot resolve a Slate range from DOM range: ${domRange}`)
    }

    const anchor = Editable.toSlatePoint(editor, [anchorNode, anchorOffset], {
      exactMatch,
      suppressThrow,
    })
    if (!anchor) {
      return null as T extends true ? Range | null : Range
    }

    const focus = isCollapsed
      ? anchor
      : Editable.toSlatePoint(editor, [focusNode, focusOffset], {
          exactMatch,
          suppressThrow,
        })
    if (!focus) {
      return null as T extends true ? Range | null : Range
    }

    let range: Range = { anchor: anchor as Point, focus: focus as Point }
    // if the selection is a hanging range that ends in a void
    // and the DOM focus is an Element
    // (meaning that the selection ends before the element)
    // unhang the range to avoid mistakenly including the void
    if (
      Range.isExpanded(range) &&
      Range.isForward(range) &&
      isDOMElement(focusNode) &&
      Editor.void(editor, { at: range.focus, mode: 'highest' })
    ) {
      range = Editor.unhangRange(editor, range, { voids: true })
    }

    return range as unknown as T extends true ? Range | null : Range
  },

  toRelativePosition(editor: Editor, x: number, y: number): [number, number] {
    const container = Editable.toDOMNode(editor, editor)
    const rootRect = container.getBoundingClientRect()

    return [x - rootRect.left, y - rootRect.top]
  },

  reverseRelativePosition(editor: Editor, x: number, y: number): [number, number] {
    const container = Editable.toDOMNode(editor, editor)
    const rootRect = container.getBoundingClientRect()
    return [x + rootRect.left, y + rootRect.top]
  },
}
