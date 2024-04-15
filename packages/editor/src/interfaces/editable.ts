import {
  Editor,
  Node,
  Text,
  Element,
  Path,
  Point,
  Range,
  Scrubber,
  Grid,
  GridCell,
  Key,
  NodeEntry,
  Drag,
  Location
} from '.'

import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_INDEX,
  NODE_TO_KEY,
  NODE_TO_PARENT,
} from '../utils/weak-maps'

import { getCharacterOffsetFromPosition } from '@/tokenizer'
import {
  DATA_EDITABLE_COMPOSITION,
  DATA_EDITABLE_LEAF,
  DATA_EDITABLE_LENGTH,
  DATA_EDITABLE_NODE,
  DATA_EDITABLE_PLACEHOLDER,
  DATA_EDITABLE_STRING,
  DATA_EDITABLE_VOID,
  DATA_EDITABLE_ZERO_WIDTH,
} from '../utils/constants'
import { SelectionEdge } from '../types'
import { DrawingSelection } from './drawing-selection'
import { OmitFirstArg } from '@/utils'
import { DOMElement, DOMHTMLElement, DOMNode, DOMPoint, DOMRange, DOMSelection, DOMStaticRange, RefObject, isActiveElementInShadowRoot, isDOMElement, isDOMNode, isDOMSelection, isDOMText, isSingleTouchEvent, normalizePoint, retrieveMainEvent } from '@/dom-utils'
import { isFirefox } from '@/dom-utils/is_firefox'
import { findNearbyElements, findContentHostingElements, findMaxLineRect, isRectInLine, isVerticallyAligned, splitRectsIntoLines, getEditorPosition } from '@/layout'
import { isChrome } from '@/dom-utils/is-chrome'
import { ElementAttributes, RenderElementAttributes, RenderElementProps, RenderLeafAttributes, RenderLeafProps, RenderPlaceholderProps, TextAttributes } from '@/editable'

export type NodeAttributes = ElementAttributes | TextAttributes

export interface SelectWordOptions {
  at?: Range
  edge?: SelectionEdge
}

/**
 * A React and DOM-specific version of the `Editor` interface.
 */
export interface Editable {
  blur: OmitFirstArg<typeof Editable.blur>
  focus: OmitFirstArg<typeof Editable.focus>
  copy: OmitFirstArg<typeof Editable.copy>
  cut: OmitFirstArg<typeof Editable.cut>
  selectWord: OmitFirstArg<typeof Editable.selectWord>
  selectLine: OmitFirstArg<typeof Editable.selectLine>
  isComposing: OmitFirstArg<typeof Editable.isComposing>
  isFocused: OmitFirstArg<typeof Editable.isFocused>
  isReadonly: OmitFirstArg<typeof Editable.isReadonly>
  insertFromClipboard: OmitFirstArg<typeof Editable.insertFromClipboard>
  insertTextFromClipboard: OmitFirstArg<typeof Editable.insertTextFromClipboard>
  insertFile: OmitFirstArg<typeof Editable.insertFile>
  onKeydown: (event: KeyboardEvent) => void
  onKeyup: (event: KeyboardEvent) => void
  onFocus: () => void
  onBlur: () => void
  onReadonly: (readonly: boolean) => void
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
  onDrawingSelectionChange: (selection: DrawingSelection | null) => void
  onDragChange: (drag: Drag | null) => void
  onTouchHold: (event: TouchEvent) => void
  onTouchTrack: () => void
  onContextMenu: (event: MouseEvent) => void
  onLocaleChange: () => void
  onRenderComplete: () => void
  onDestory: () => void
  renderElementAttributes: (props: RenderElementAttributes) => ElementAttributes
  renderLeafAttributes: (props: RenderLeafAttributes) => TextAttributes
  renderElement: (props: RenderElementProps) => HTMLElement
  renderLeaf: (props: RenderLeafProps) => HTMLElement
  renderPlaceholder: (props: RenderPlaceholderProps) => DOMNode | void | null
  toDataTransfer: (range?: Range) => DataTransfer | null
}

export interface EditableInterface {

  /**
   * Blur the editor.
   */
  blur: (editor: Editor) => void

  /**
   * Focus the editor.
   */
  focus: (editor: Editor, start?: boolean) => void

  /**
   * Copy the content of the selection to the clipboard.
   */
  copy: (editor: Editor, range?: Range) => void

  /**
   * Cut the content of the selection to the clipboard.
   */
  cut: (editor: Editor, range?: Range) => void

  /**
   * Select a word at a location.
  */
  selectWord: (editor: Editor, at?: Location, edge?: SelectionEdge) => void

  /**
   * Select a line at a location.
   */
  selectLine: (editor: Editor, at?: Location, edge?: SelectionEdge) => void
  /**
   * Check if the user is currently composing inside the editor.
   */
  isComposing: (editor: Editor) => boolean

  /**
   * Check if the editor is focused.
   */
  isFocused: (editor: Editor) => boolean

  /**
   * Check if the editor is readonly.
   */
  isReadonly: (editor: Editor) => boolean

  /**
   * Check if the selection is at the start or end of a line.
   */
  isSelectionAtLineEdge: (editor: Editor, options?: { point?: Point; edge?: SelectionEdge }) => boolean

  /**
   * Insert data from clipboard at a location.
   */
  insertFromClipboard: (editor: Editor, at?: Range) => void

  /**
   * Insert text from clipboard at a location.
   */
  insertTextFromClipboard: (editor: Editor, at?: Range) => void

  /**
   * Insert a file at a location.
   */
  insertFile: (editor: Editor, file: File, at?: Range) => void
  /**
   * Find a key for a Editor node.
   */
  findKey: (editor: Editor, node: Node) => Key

  /**
   * Find the path of Editor node.
   */
  findPath: (editor: Editor, node: Node) => Path

  /**
   * Check if a DOM node is within the editor.
   */
  hasDOMNode: (editor: Editor, node: DOMNode) => boolean

  /**
   * Find the native DOM element from a Editor node.
   */
  getDOMNode: (editor: Editor, node: Node) => DOMHTMLElement

  /**
   * Find a native DOM selection point from a Editor point.
   */
  getDOMPoint: (editor: Editor, point: Point) => DOMPoint

  /**
   * Find a native DOM range from a Editor `range`.
   *
   * Notice: the returned range will always be ordinal regardless of the direction of Editor `range` due to DOM API limit.
   *
   * there is no way to create a reverse DOM Range using Range.setStart/setEnd
   * according to https://dom.spec.whatwg.org/#concept-range-bp-set.
   */
  getDOMRange: (editor: Editor, range: Range) => DOMRange

  /**
   * Find a Editor node from a native DOM `element`.
   */
  getEditorNode: (editor: Editor, element: DOMNode) => Node

  /**
   * Find a Editor point from a DOM selection's `offsetNode` and `domOffset`.
   */
  getEditorPoint: <T extends boolean>(
    editor: Editor,
    domPoint: DOMPoint,
    options: {
      exactMatch: T
      suppressThrow: T
    },
  ) => T extends true ? Point | null : Point

  /**
   * Get the target point from a DOM `event`.
   */
  getEditorPointFromDOMEvent: (editor: Editor, event: TouchEvent | MouseEvent | Touch) => Point | null

  /**
   * Get previous line point from a Editor range.
   */
  getPreviousLinePoint: (editor: Editor, at?: Range) => Point | null

  /**
   * Get next line point from a Editor range.
   */
  getNextLinePoint: (editor: Editor, at?: Range) => Point | null

  /**
   * Get the line edge point from a Editor range.
   */
  getLineEdgePoint: (editor: Editor, options?: { at?: Range; edge?: 'start' | 'end' }) => Point | null

  /**
   * Get the nearest point from a DOM position.
   */
  getNearestPointFromDOMPosition: (editor: Editor, node: DOMNode, position: { x: number, y: number }) => Point | null

  /**
   * Find a Editor range from a DOM range or selection.
   */
  getEditorRange: <T extends boolean>(
    editor: Editor,
    domRange: DOMRange | DOMStaticRange | DOMSelection,
    options: {
      exactMatch: T
      suppressThrow: T
    },
  ) => T extends true ? Range | null : Range

  /**
   * Get a Editor position
   */
  getEditorPosition: (editor: Editor) => { x: number; y: number }

  /**
   * Return the host window of the current editor.
   */
  getWindow: (editor: Editor) => Window

  /**
   * Find the DOM node that implements DocumentOrShadowRoot for the editor.
   */
  getDocumentOrShadowRoot: (editor: Editor) => Document | ShadowRoot

  /**
   * Get the selected line element and its index within the selection range.
   */
  getSelectedLine: (editor: Editor, options?: { range?: Range; match?: (element: Element) => boolean }) => [Element, number] | null

  /**
   * Get the line rectangles of a given node in an editor.
   */
  getLineRectsFromNode: (editor: Editor, node: Node, minWidth?: number) => DOMRect[]

  /**
   * Get the line rectangles of a given range in an editor.
   */
  getLineRectsFromRange: (editor: Editor, range: Range, minWidth?: number) => DOMRect[]

  /**
   * From all the text within the Block node located at the Point position, and recalculate Point.offset The offset located in all the text
   */
  getBlockTextAndOffsetFromPoint: (editor: Editor, point: Point) => { text: string; offset: number }

  /**
   * Get the sub point from the Block node text and offset
   */
  getSubPointFromBlockTextAndOffset: (editor: Editor, blockPath: Path, offset: number, toNext?: boolean) => Point

}

export const Editable: EditableInterface = {
  blur(editor: Editor): void {
    editor.blur()
  },

  focus(editor: Editor, start = false): void {
    editor.focus(start)
  },

  copy(editor: Editor, range?: Range): void {
    editor.copy(range)
  },

  cut(editor: Editor, range?: Range): void {
    editor.cut(range)
  },

  selectWord(editor: Editor, at?: Location, edge?: SelectionEdge): void {
    editor.selectWord(at, edge)
  },

  selectLine(editor: Editor, at?: Location, edge?: SelectionEdge): void {
    editor.selectLine(at, edge)
  },

  /**
   * Check if the user is currently composing inside the editor.
   */
  isComposing(editor: Editor): boolean {
    return editor.isComposing()
  },

  isFocused(editor: Editor): boolean {
    return editor.isFocused()
  },

  isReadonly(editor: Editor): boolean {
    return editor.isReadonly()
  },

  isSelectionAtLineEdge: (editor: Editor, options: { point?: Point; edge?: SelectionEdge } = {}): boolean => {
    const { point = editor.selection?.focus, edge = 'start' } = options
    if (!point) return false
    const entry = Editor.above(editor, { at: point, match: n => Element.isElement(n) && Editor.isBlock(editor, n) })
    if (!entry) return false
    const [block] = entry
    const rangeLines = Editor.getLineRectsFromRange(editor, { anchor: point, focus: point })
    if (rangeLines.length === 0) return false
    const rangeLine = rangeLines[0]
    const lines = Editor.getLineRectsFromNode(editor, block)
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

  insertFromClipboard(editor: Editor, at?: Range): void {
    editor.insertFromClipboard(at)
  },

  insertTextFromClipboard(editor: Editor, at?: Range): void {
    editor.insertTextFromClipboard(at)
  },

  insertFile(editor: Editor, file: File, at?: Range): void {
    editor.insertFile(file, at)
  },

  findKey(editor: Editor, node: Node): Key {
    let key = NODE_TO_KEY.get(node)

    if (!key) {
      key = Key.create()
      NODE_TO_KEY.set(node, key)
    }

    return key
  },

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

    throw new Error(
      `Unable to find the path for Slate node: ${Scrubber.stringify(node)}`
    )
  },

  hasDOMNode: (editor: Editor, node: DOMNode): boolean => {
    const editorEl = Editor.getDOMNode(editor, editor)
    let targetEl

    // COMPAT: In Firefox, reading `target.nodeType` will throw an error if
    // target is originating from an internal "restricted" element (e.g. a
    // stepper arrow on a number input). (2018/05/04)
    // https://github.com/ianstormtaylor/slate/issues/1819
    try {
      targetEl = (isDOMElement(node) ? node : node.parentElement) as HTMLElement
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

  getDOMNode: (editor: Editor, node: Node): DOMHTMLElement => {
    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
    const offsetNode = Editor.isEditor(node)
      ? EDITOR_TO_ELEMENT.get(editor)
      : KEY_TO_ELEMENT?.get(Editor.findKey(editor, node))
    if (!offsetNode) {
      throw new Error(`Cannot resolve a DOM node from Editor node: ${Scrubber.stringify(node)}`)
    }
    return offsetNode
  },

  getDOMPoint: (editor: Editor, point: Point): DOMPoint => {
    const [node] = Editor.node(editor, point.path)
    const el = Editor.getDOMNode(editor, node)
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
      throw new Error(`Cannot resolve a DOM point from Editor point: ${Scrubber.stringify(point)}`)
    }

    return domPoint
  },

  getDOMRange: (editor: Editor, range: Range): DOMRange => {
    const { anchor, focus } = range
    const isBackward = Range.isBackward(range)
    const domAnchor = Editor.getDOMPoint(editor, anchor)
    const domFocus = Range.isCollapsed(range) ? domAnchor : Editor.getDOMPoint(editor, focus)

    const window = Editor.getWindow(editor)
    const domRange = window.document.createRange()
    const [startNode, startOffset] = isBackward ? domFocus : domAnchor
    const [endNode, endOffset] = isBackward ? domAnchor : domFocus

    // A editor Point at zero-width Leaf always has an offset of 0 but a native DOM selection at
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

  getEditorNode: (editor: Editor, element: DOMNode): Node => {
    let domEl = isDOMElement(element) ? element : element.parentElement

    if (domEl && !domEl.hasAttribute(DATA_EDITABLE_NODE)) {
      domEl = domEl.closest(`[${DATA_EDITABLE_NODE}]`)
    }

    const node = domEl ? ELEMENT_TO_NODE.get(domEl as HTMLElement) : null

    if (!node) {
      throw new Error(`Cannot resolve a Editor node from DOM node: ${domEl}`)
    }

    return node
  },

  getEditorPoint: <T extends boolean>(
    editor: Editor,
    domPoint: DOMPoint,
    options: {
      exactMatch: T
      suppressThrow: T
    },
  ): T extends true ? Point | null : Point => {
    const { exactMatch, suppressThrow } = options
    const [nearestNode, nearestOffset] = exactMatch ? domPoint : normalizePoint(domPoint)
    const parentNode = nearestNode.parentNode as DOMElement
    let textNode: DOMElement | null = null
    let offset = 0

    if (parentNode) {
      const editorEl = Editor.getDOMNode(editor, editor)
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
          const window = Editor.getWindow(editor)
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
        // COMPAT: If the parent node is a Editor zero-width space, editor is
        // because the text node should have no characters. However, during IME
        // composition the ASCII characters will be prepended to the zero-width
        // space, so subtract 1 from the offset to account for the zero-width
        // space character.
        (parentNode.hasAttribute(DATA_EDITABLE_ZERO_WIDTH) ||
          // COMPAT: In Firefox, `range.cloneContents()` returns an extra trailing '\n'
          // when the document ends with a new-line character. This results in the offset
          // length being off by one, so we need to subtract one to account for this.
          (isFirefox && offsetNode.textContent?.endsWith('\n\n')))
      ) {
        offset--
      }
    }

    if (!textNode) {
      if (suppressThrow) {
        return null as T extends true ? Point | null : Point
      }
      throw new Error(`Cannot resolve a Editor point from DOM point: ${domPoint}`)
    }

    // COMPAT: If someone is clicking from one Editor editor into another,
    // the select event fires twice, once for the old editor's `element`
    // first, and then afterwards for the correct `element`. (2017/03/03)
    const editorNode = Editor.getEditorNode(editor, textNode!)
    const path = Editable.findPath(editor, editorNode)
    return { path, offset } as T extends true ? Point | null : Point
  },

  getEditorPosition: getEditorPosition,

  getEditorPointFromDOMEvent: (editor: Editor, event: TouchEvent | MouseEvent | Touch): Point | null => {
    event = retrieveMainEvent(event)
    const { clientX: x, clientY: y } = event

    if (x == null || y == null) {
      throw new Error(`Cannot resolve a Editor range from a DOM event: ${event}`)
    }
    let target = event.target
    if (isSingleTouchEvent(event)) {
      target = document.elementFromPoint(event.clientX, event.clientY)
    }
    if (!target) {
      throw new Error(`Cannot resolve a Editor range from a DOM event: ${event}`)
    }

    return Editor.getNearestPointFromDOMPosition(editor, target as DOMNode, {
      x, y
    })
  },

  getPreviousLinePoint: (editor: Editor, at?: Range): Point | null => {
    const { selection } = editor
    if (!at && selection) at = selection
    if (!at) return null
    const startPoint = Range.start(at)
    const endPoint = Range.end(at)
    const startRange = Editor.getDOMRange(editor, { anchor: startPoint, focus: startPoint })
    const endRange = Editor.getDOMRange(editor, { anchor: endPoint, focus: endPoint })

    const startRects = startRange.getClientRects()
    const endRects = endRange.getClientRects()

    const block = Editor.above(editor, {
      at: at.focus,
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    })
    let top = endRects[0].top
    let isFind = false

    let isSameLine = true

    let prevBlock = block
    let domBlock: DOMElement | null = null
    while (prevBlock && !isFind) {
      const [block, path] = prevBlock
      domBlock = Editor.getDOMNode(editor, block)
      const lowestElements = findContentHostingElements(editor, block)
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
          match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        })
      }
    }
    if (!domBlock) return null
    return Editor.getNearestPointFromDOMPosition(
      editor,
      domBlock,
      {
        x: isFind && !isSameLine ? startRects[0].x : 0,
        y: top
      }
    )
  },

  getNextLinePoint: (editor: Editor, at?: Range): Point | null => {
    const { selection } = editor
    if (!at && selection) at = selection
    if (!at) return null
    const startPoint = Range.start(at)
    const endPoint = Range.end(at)
    const startRange = Editor.getDOMRange(editor, { anchor: startPoint, focus: startPoint })
    const endRange = Editor.getDOMRange(editor, { anchor: endPoint, focus: endPoint })

    const startRects = startRange.getClientRects()
    const endRects = endRange.getClientRects()

    let blockEntry = Editor.above(editor, {
      at: at.focus,
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    })
    let bottom = endRects[0].bottom
    let isFind = false
    let isSameLine = true
    let domBlock: DOMElement | null = null
    while (blockEntry && !isFind) {
      const [block, path] = blockEntry
      domBlock = Editor.getDOMNode(editor, block)
      const lowestElements = findContentHostingElements(editor, block)
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
          match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        })
        isSameLine = false
      }
    }
    if (!domBlock) return null

    return Editor.getNearestPointFromDOMPosition(
      editor,
      domBlock,
      {
        x: isFind && !isSameLine ? startRects[0].x : 99999,
        y: bottom
      },
    )
  },

  getLineEdgePoint: (editor: Editor, { at, edge }: { at?: Range; edge?: 'start' | 'end' } = {}): Point | null => {
    const { selection } = editor
    if (!at && selection) at = selection
    if (!at) return null
    const isStart = edge === 'start'
    const point = isStart ? Range.start(at) : Range.end(at)
    const range = Editor.getDOMRange(editor, {
      anchor: point,
      focus: point,
    })
    range.collapse(isStart)
    const rects = range.getClientRects()
    const rect = rects[rects.length - 1]
    const bottom = rect.top + rect.height / 2
    const block = Editor.above(editor, {
      at: point,
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    })
    if (!block) return null
    const domBlock = Editor.getDOMNode(editor, block[0])
    return Editor.getNearestPointFromDOMPosition(editor, domBlock, {
      x: isStart ? -99999 : 99999,
      y: bottom
    })
  },

  getNearestPointFromDOMPosition: (editor: Editor, node: DOMNode, position: { x: number, y: number }): Point | null => {
    const domEl = isDOMElement(node) ? node : node.parentElement
    if (!domEl) return null
    const { x, y } = position
    const elements: DOMElement[] = []
    let element: DOMElement | null = domEl.hasAttribute(DATA_EDITABLE_NODE)
      ? domEl
      : domEl.closest(`[${DATA_EDITABLE_NODE}]`)

    const addToElements = (node: Node) => {
      const children = findContentHostingElements(editor, node)
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
      const node = Editor.getEditorNode(editor, element)
      if (Text.isText(node) || Editor.isVoid(editor, node)) {
        addToElements(node)
      } else {
        if (!Editor.isSolid(editor, node)) {
          const rect = element.getBoundingClientRect()
          const reverse = x < rect.left + rect.width / 2
          const adjacent = (reverse ? Editor.previous : Editor.next)(editor, {
            at: Editor.findPath(editor, node),
          })
          if (adjacent) {
            addToElements(adjacent[0])
          }
        } else {
          const isGrid = Grid.isGrid(node)
          const nodes = Editor.nodes(editor, {
            at: Editor.findPath(editor, node),
            match: n => (isGrid && GridCell.isGridCell(n)) || Text.isText(n),
            mode: 'highest',
          })
          for (const [child] of nodes) {
            if (Element.isElement(child) && Editor.isBlock(editor, child)) {
              elements.push(Editor.getDOMNode(editor, child))
            } else addToElements(child)
          }
        }
      }
    }
    let top = y,
      left = x
    const nodes = findNearbyElements(elements, x, y)
    if (!nodes) return null
    let offsetNode: DOMElement | null = null
    if (isDOMNode(nodes)) {
      offsetNode = nodes
    } else {
      const { top: nearbyTop, left: nearbyLeft, right: nearbyRight, bottom: nearbyBelow } = nodes

      if (nearbyLeft && nearbyBelow) {
        if (isVerticallyAligned(nearbyBelow.rect, nearbyLeft.rect)) {
          offsetNode = nearbyBelow.element
          top = nearbyBelow.rect.top
        } else {
          offsetNode = nearbyLeft.element
          left = nearbyLeft.rect.right
        }
      } else if (nearbyRight && nearbyBelow) {
        if (isVerticallyAligned(nearbyBelow.rect, nearbyRight.rect)) {
          offsetNode = nearbyBelow.element
          top = nearbyBelow.rect.top
        } else {
          offsetNode = nearbyRight.element
          left = nearbyRight.rect.left
        }
      } else if (nearbyLeft) {
        offsetNode = nearbyLeft.element
        if (left <= nearbyLeft.rect.left) left = nearbyLeft.rect.left
        else if (left >= nearbyLeft.rect.right) left = nearbyLeft.rect.right
        else {
          top = nearbyLeft.rect.top
        }
      } else if (nearbyRight) {
        offsetNode = nearbyRight.element
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
        offsetNode = nearbyBelow.element
      } else if (nearbyTop) {
        offsetNode = nearbyTop.element
        if (left < nearbyTop.rect.left) {
          left = nearbyTop.rect.left
        } else if (left > nearbyTop.rect.right) {
          left = nearbyTop.rect.right
        }
        top = nearbyTop.rect.bottom
      }
    }
    if (!offsetNode) return null
    const _node = Editor.getEditorNode(editor, offsetNode)
    if (Text.isText(_node)) {
      const path = Editor.findPath(editor, _node)
      if (_node.text.length === 0) {
        return {
          path,
          offset: 0,
        }
      }
      const textNodes = findContentHostingElements(editor, _node)
      let startOffset = 0
      for (let s = 0; s < textNodes.length; s++) {
        const textNode = textNodes[s]
        if (textNode === offsetNode) break
        startOffset += (textNode.textContent ?? '').length
      }
      const textNode = isDOMText(offsetNode) ? offsetNode : offsetNode.firstChild
      if (!isDOMText(textNode)) return null
      const content = textNode.textContent ?? ''
      const offset = getCharacterOffsetFromPosition(textNode, left, top, 0, content.length, content.length)
      return {
        path,
        offset: startOffset + offset,
      }
    } else if (Element.isElement(_node)) {
      const point = Editor.getEditorPoint(editor, [offsetNode, 0], {
        exactMatch: false,
        suppressThrow: true,
      })
      if (!point) return Editor.start(editor, Editor.findPath(editor, _node))
      return point
    }
    return null
  },

  getEditorRange: <T extends boolean>(
    editor: Editor,
    domRange: DOMRange | DOMStaticRange | DOMSelection,
    options: {
      exactMatch: T
      suppressThrow: T
    },
  ): T extends true ? Range | null : Range => {
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
        if (isChrome && isActiveElementInShadowRoot()) {
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
      throw new Error(`Cannot resolve a Editor range from DOM range: ${domRange}`)
    }

    const anchor = Editor.getEditorPoint(editor, [anchorNode, anchorOffset], {
      exactMatch,
      suppressThrow,
    })
    if (!anchor) {
      return null as T extends true ? Range | null : Range
    }

    const focus = isCollapsed
      ? anchor
      : Editor.getEditorPoint(editor, [focusNode, focusOffset], {
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

  getWindow: (editor: Editor): Window => {
    const window = EDITOR_TO_WINDOW.get(editor)
    if (!window) {
      throw new Error('Unable to find a host window element for this editor')
    }
    return window
  },

  getDocumentOrShadowRoot: (editor: Editor): Document | ShadowRoot => {
    const el = Editor.getDOMNode(editor, editor)
    const root = el.getRootNode()

    if (
      (root instanceof Document || root instanceof ShadowRoot) &&
      (root as any).getSelection != null
    ) {
      return root
    }

    return el.ownerDocument
  },

  getSelectedLine: (editor, options = {}) => {
    const { range = editor.selection, match = () => true } = options
    if (!range || Range.isCollapsed(range)) return null
    const start = Range.start(range)
    const entry = Editor.above(editor, { at: start, match: n => Element.isElement(n) && Editor.isBlock(editor, n) })
    if (!entry) return null
    const rangeLines = Editor.getLineRectsFromRange(editor, range)
    let [block, path] = entry
    while (block) {
      if (match(block)) {
        const elLines = Editor.getLineRectsFromNode(editor, block)
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
      const next = Editor.next(editor, { at: path, match: n => Element.isElement(n) && Editor.isBlock(editor, n) })
      if (!next) return null
      const [n, p] = next
      block = n as Element
      path = p
    }
    return null
  },

  getLineRectsFromNode: (editor, node, minWidth = 4) => {
    const path = Editor.findPath(editor, node);
    const blockEntry: NodeEntry | undefined =
      Element.isElement(node) && Editor.isBlock(editor, node) && path.length === 1
        ? [node, path]
        : Editor.above<Element>(editor, {
          at: path,
          match: n => Element.isElement(n) && Editor.isBlock(editor, n),
          mode: 'highest',
        });
    if (!blockEntry) return [];
    const editorDomElement = Editor.getDOMNode(editor, blockEntry[0]);
    const editorDomRectangle = editorDomElement.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(Editor.getDOMNode(editor, node));
    const splitLineRectangles = splitRectsIntoLines(range.getClientRects());
    const lineRectangles: DOMRect[] = [];
    for (const [line, rects] of splitLineRectangles) {
      let width = line.right - line.left;
      const lineRectangle = findMaxLineRect(editor, editorDomElement, line.top, line.bottom);
      line.top = lineRectangle.top;
      line.height = lineRectangle.height;
      line.bottom = lineRectangle.bottom;
      // 空节点的宽度给个最小值
      if (width < 1 && editorDomRectangle.left === rects[0].left) {
        width = minWidth;
      }
      lineRectangles.push(new DOMRect(rects[0].left, line.top, width, line.height));
    }
    return lineRectangles;
  },

  getLineRectsFromRange: (editor, range, minWidth = 4) => {
    const anchor = Range.start(range)
    const focus = Range.end(range)
    // Get the block node at the start position
    const startBlockEntry = Editor.above<Element>(editor, {
      at: anchor,
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      mode: 'lowest',
    })
    // Get the block node at the end position
    const endBlockEntry = Editor.above<Element>(editor, {
      at: focus,
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      mode: 'lowest',
    })
    if (!startBlockEntry || !endBlockEntry) return []

    const blockRects: DOMRect[] = []
    const rectMap: Map<
      DOMRect,
      {
        domElement: DOMElement
        element: Element
      }
    > = new Map()

    let [startBlock, startPath] = startBlockEntry
    let [_, endPath] = endBlockEntry
    const ranges: DOMRange[] = []
    let isStart = true
    let next: NodeEntry<Element> | undefined = startBlockEntry
    while (next) {
      const [nextBlock, nextPath] = next as NodeEntry<Element>
      const domElement = Editor.getDOMNode(editor, nextBlock)
      const rect = domElement.getBoundingClientRect()
      rectMap.set(rect, {
        domElement,
        element: nextBlock,
      })
      blockRects.push(rect)

      if (Path.equals(nextPath, endPath)) break
      if (!isStart) {
        const range = document.createRange()
        range.selectNodeContents(domElement)
        ranges.push(range)
      } else {
        isStart = false
      }
      next = Editor.next<Element>(editor, {
        at: nextPath,
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      })
    }
    if (Path.equals(startPath, endPath)) {
      ranges.unshift(Editor.getDOMRange(editor, range))
    } else {
      ranges.unshift(
        Editor.getDOMRange(editor, {
          anchor,
          focus: Editor.end(editor, {
            path: startPath,
            offset: startBlock.children.length,
          }),
        }),
      )
      ranges.push(
        Editor.getDOMRange(editor, {
          anchor: Editor.start(editor, {
            path: endPath,
            offset: 0,
          }),
          focus,
        }),
      )
    }

    // Split the lines
    const rects: DOMRect[] = []
    for (const range of ranges) {
      rects.push(...range.getClientRects())
    }
    const lines = splitRectsIntoLines(rects)
    const lineRects: DOMRect[] = []
    let prevLineRect: DOMRect | null = null
    for (const [line, rects] of lines) {
      // Find the corresponding element for the line
      const blockRect = blockRects.find(
        r =>
          isRectInLine(r, line) &&
          (line.left >= r.left || Math.abs(line.left - r.left) < 1) &&
          (line.right <= r.right || Math.abs(line.right - r.right) < 1),
      )
      const block = blockRect ? rectMap.get(blockRect) : null

      let width = line.right - line.left
      if (block) {
        const { domElement, element } = block
        const lineRect = findMaxLineRect(editor, domElement, line.top, line.bottom)
        line.top = lineRect.top
        line.height = lineRect.height
        // Set a minimum width for empty nodes
        if (
          domElement &&
          Editor.isEmpty(editor, element) &&
          width < 1 &&
          domElement.getBoundingClientRect().left === line.left
        ) {
          width = minWidth
        }
      }
      // Remove overlapping parts between lines
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
  },

  getBlockTextAndOffsetFromPoint: (editor, point) => {
    const blockEntry = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      at: point,
    })
    const data = {
      text: '',
      offset: 0,
    }
    if (!blockEntry) {
      throw new Error(`Cannot resolve a Editor block from a point: ${point}`)
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

  getSubPointFromBlockTextAndOffset: (editor, path, offset, toNext) => {
    const blockEntry = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      at: path,
    })
    if (!blockEntry) {
      throw new Error(`Cannot resolve a Editor block from a path: ${path}`)
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
        if (toNext && offset > 0 && totalOffset === offset) {
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
}
