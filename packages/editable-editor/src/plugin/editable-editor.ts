import {
  BaseEditor,
  Editor,
  Node,
  Text,
  Element,
  Path,
  Point,
  Range,
  Scrubber,
  Transforms,
  EditorMarks,
} from 'slate'

import { Key } from '../utils/key'
import {
  EDITOR_TO_ELEMENT,
  ELEMENT_TO_NODE,
  IS_FOCUSED,
  IS_READ_ONLY,
  NODE_TO_INDEX,
  NODE_TO_KEY,
  NODE_TO_PARENT,
  EDITOR_TO_WINDOW,
  EDITOR_TO_KEY_TO_ELEMENT,
  IS_COMPOSING,
  EDITOR_TO_TEXTAREA,
  EDITOR_TO_SHADOW,
} from '../utils/weak-maps'
import {
  DOMElement,
  DOMNode,
  DOMPoint,
  DOMRange,
  DOMSelection,
  DOMStaticRange,
  isDOMElement,
  isDOMSelection,
  normalizeDOMPoint,
  hasShadowRoot,
  isDOMNode,
  isDOMText,
} from '../utils/dom'
import { IS_CHROME, IS_FIREFOX } from '../utils/environment'
import findClosestNode, { isAlignY } from '../utils/closest'
import { getTextOffset } from '../utils/string'

export interface SelectionStyle {
  focusBgColor?: string
  blurBgColor?: string
  caretColor?: string
  caretWidth?: number
}

/**
 * `RenderElementProps` are passed to the `renderElement` handler.
 */
export interface RenderElementProps {
  children: any
  element: Element
  attributes: {
    'data-slate-node': 'element'
    'data-slate-inline'?: true
    'data-slate-void'?: true
    dir?: 'rtl'
    ref: any
  }
}

/**
 * `RenderLeafProps` are passed to the `renderLeaf` handler.
 */
export interface RenderLeafProps {
  children: any
  text: Text
  attributes: React.HTMLAttributes<HTMLElement> & Record<'data-slate-leaf', true>
}

export interface RenderPlaceholderProps {
  children: any
  attributes: React.HTMLAttributes<HTMLElement> & Record<'data-slate-placeholder', true>
  node: Node
}

export interface EditorElements {
  [key: string]: Omit<Element, 'children'>[]
}

/**
 * A React and DOM-specific version of the `Editor` interface.
 */
export interface EditableEditor extends BaseEditor {
  insertData: (data: DataTransfer) => void
  insertFragmentData: (data: DataTransfer) => boolean
  insertTextData: (data: DataTransfer) => boolean
  setFragmentData: (
    data: DataTransfer,
    originEvent?: 'drag' | 'copy' | 'cut'
  ) => void
  hasRange: (editor: EditableEditor, range: Range) => boolean
  queryActiveMarks: () => EditorMarks,
  queryActiveElements: () => EditorElements,
  onKeydown: (event: KeyboardEvent) => void
  onKeyup: (event: KeyboardEvent) => void
  onFocus: () => void
  onBlur: () => void
  onInput: (value: string) => void
  onBeforeInput: (value: string) => void
  onCompositionStart: (value: string) => void
  onCompositionEnd: (value: string) => void
  onSelectStart: () => void
  onSelecting: () => void
  onSelectEnd: () => void
  onSelectionChange: () => void
  setSelectionStyle: (style: SelectionStyle) => void
  renderElement: (props: RenderElementProps) => JSX.Element
  renderLeaf: (props: RenderLeafProps) => JSX.Element
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element | void | null
}

export const EditableEditor = {
  /**
   * Check if the user is currently composing inside the editor.
   */
  isComposing(editor: EditableEditor): boolean {
    return !!IS_COMPOSING.get(editor)
  },

  isEmpty(editor: EditableEditor, node: Node): boolean {
    if(Text.isText(node)) {
      return node.text === '' && !IS_COMPOSING.get(editor)
    }
    else {
      if(node.children.length === 0) return true
      if(node.children.length === 1) return !Editor.isVoid(editor, node) && EditableEditor.isEmpty(editor, (node as Element).children[0])
      return false
    }
  },

  /**
   * Return the host window of the current editor.
   */
  getWindow(editor: EditableEditor): Window {
    const window = EDITOR_TO_WINDOW.get(editor)
    if (!window) {
      throw new Error('Unable to find a host window element for this editor')
    }
    return window
  },

  /**
   * Find a key for a Slate node.
   */

  findKey(editor: EditableEditor, node: Node): Key {
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

  findPath(editor: EditableEditor, node: Node): Path {
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

  /**
   * Find the DOM node that implements DocumentOrShadowRoot for the editor.
   */

  findDocumentOrShadowRoot(editor: EditableEditor): Document | ShadowRoot {
    const el = EditableEditor.toDOMNode(editor, editor)
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
  isFocused(editor: EditableEditor): boolean {
    return !!IS_FOCUSED.get(editor)
  },

  /**
   * Check if the editor is in read-only mode.
   */

  isReadOnly(editor: EditableEditor): boolean {
    return !!IS_READ_ONLY.get(editor)
  },

  /**
   * Blur the editor.
   */

  blur(editor: EditableEditor): void {
    const shadow = EDITOR_TO_SHADOW.get(editor)
    const textarea = EDITOR_TO_TEXTAREA.get(editor)
    if (textarea && shadow && shadow.activeElement !== textarea) {
      textarea.blur()
    }
  },

  /**
   * Focus the editor.
   */
  focus(editor: EditableEditor): void {
    const shadow = EDITOR_TO_SHADOW.get(editor)
    const textarea = EDITOR_TO_TEXTAREA.get(editor)
    if (textarea && shadow && shadow.activeElement !== textarea) {
      textarea.focus({ preventScroll: true })
    }
  },

  deselect(editor: EditableEditor): void {
    const { selection } = editor
    if (selection) {
      Transforms.deselect(editor)
    }
  },

  /**
   * Check if a DOM node is within the editor.
   */
  hasDOMNode(
    editor: EditableEditor,
    target: DOMNode
  ): boolean {
    const editorEl = EditableEditor.toDOMNode(editor, editor)
    let targetEl

    // COMPAT: In Firefox, reading `target.nodeType` will throw an error if
    // target is originating from an internal "restricted" element (e.g. a
    // stepper arrow on a number input). (2018/05/04)
    // https://github.com/ianstormtaylor/slate/issues/1819
    try {
      targetEl = (isDOMElement(target)
        ? target
        : target.parentElement) as HTMLElement
    } catch (err: any) {
      if (
        !err.message.includes('Permission denied to access property "nodeType"')
      ) {
        throw err
      }
    }

    if (!targetEl) {
      return false
    }

    return targetEl.closest(`[data-slate-editor]`) === editorEl
  },

  /**
   * Insert data from a `DataTransfer` into the editor.
   */

  insertData(editor: EditableEditor, data: DataTransfer): void {
    editor.insertData(data)
  },

  /**
   * Insert fragment data from a `DataTransfer` into the editor.
   */

  insertFragmentData(editor: EditableEditor, data: DataTransfer): boolean {
    return editor.insertFragmentData(data)
  },

  /**
   * Insert text data from a `DataTransfer` into the editor.
   */

  insertTextData(editor: EditableEditor, data: DataTransfer): boolean {
    return editor.insertTextData(data)
  },

  /**
   * Sets data from the currently selected fragment on a `DataTransfer`.
   */

  setFragmentData(
    editor: EditableEditor,
    data: DataTransfer,
    originEvent?: 'drag' | 'copy' | 'cut'
  ): void {
    editor.setFragmentData(data, originEvent)
  },

  /**
   * Find the native DOM element from a Slate node.
   */

  toDOMNode(editor: EditableEditor, node: Node): HTMLElement {
    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
    const offsetNode = Editor.isEditor(node)
      ? EDITOR_TO_ELEMENT.get(editor)
      : KEY_TO_ELEMENT?.get(EditableEditor.findKey(editor, node))

    if (!offsetNode) {
      throw new Error(
        `Cannot resolve a DOM node from Slate node: ${Scrubber.stringify(node)}`
      )
    }

    return offsetNode
  },

  /**
   * Find a native DOM selection point from a Slate point.
   */

  toDOMPoint(editor: EditableEditor, point: Point): DOMPoint {
    const [node] = Editor.node(editor, point.path)
    const el = EditableEditor.toDOMNode(editor, node)
    let domPoint: DOMPoint | undefined

    // If we're inside a void node, force the offset to 0, otherwise the zero
    // width spacing character will result in an incorrect offset of 1
    if (Editor.void(editor, { at: point })) {
      point = { path: point.path, offset: 0 }
    }

    // For each leaf, we need to isolate its content, which means filtering
    // to its direct text and zero-width spans. (We have to filter out any
    // other siblings that may have been rendered alongside them.)
    const selector = `[data-slate-string], [data-slate-composition], [data-slate-zero-width]`
    const texts = Array.from(el.querySelectorAll(selector))
    let start = 0

    for (const text of texts) {
      const offsetNode = text.childNodes[0] as HTMLElement

      if (offsetNode == null || offsetNode.textContent == null) {
        continue
      }

      const { length } = offsetNode.textContent
      const attr = text.getAttribute('data-slate-length')
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
      throw new Error(
        `Cannot resolve a DOM point from Slate point: ${Scrubber.stringify(
          point
        )}`
      )
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

  toDOMRange(editor: EditableEditor, range: Range): DOMRange {
    const { anchor, focus } = range
    const isBackward = Range.isBackward(range)
    const domAnchor = EditableEditor.toDOMPoint(editor, anchor)
    const domFocus = Range.isCollapsed(range)
      ? domAnchor
      : EditableEditor.toDOMPoint(editor, focus)

    const window = EditableEditor.getWindow(editor)
    const domRange = window.document.createRange()
    const [startNode, startOffset] = isBackward ? domFocus : domAnchor
    const [endNode, endOffset] = isBackward ? domAnchor : domFocus

    // A slate Point at zero-width Leaf always has an offset of 0 but a native DOM selection at
    // zero-width node has an offset of 1 so we have to check if we are in a zero-width node and
    // adjust the offset accordingly.
    const startEl = (isDOMElement(startNode)
      ? startNode
      : startNode.parentElement) as HTMLElement
    const isStartAtZeroWidth = !!startEl.getAttribute('data-slate-zero-width')
    const endEl = (isDOMElement(endNode)
      ? endNode
      : endNode.parentElement) as HTMLElement
    const isEndAtZeroWidth = !!endEl.getAttribute('data-slate-zero-width')

    domRange.setStart(startNode, isStartAtZeroWidth ? 1 : startOffset)
    domRange.setEnd(endNode, isEndAtZeroWidth ? 1 : endOffset)
    return domRange
  },

  /**
   * Find a Slate node from a native DOM `element`.
   */

  toSlateNode(editor: EditableEditor, offsetNode: DOMNode): Node {
    let domEl = isDOMElement(offsetNode) ? offsetNode : offsetNode.parentElement

    if (domEl && !domEl.hasAttribute('data-slate-node')) {
      domEl = domEl.closest(`[data-slate-node]`)
    }

    const node = domEl ? ELEMENT_TO_NODE.get(domEl as HTMLElement) : null

    if (!node) {
      throw new Error(`Cannot resolve a Slate node from DOM node: ${domEl}`)
    }

    return node
  },

  findEventRange(editor: EditableEditor, event: any): Range {
    if ('nativeEvent' in event) {
      event = event.nativeEvent
    }

    const { clientX: x, clientY: y, target } = event

    if (x == null || y == null) {
      throw new Error(`Cannot resolve a Slate range from a DOM event: ${event}`)
    }

    const node = EditableEditor.toSlateNode(editor, event.target)
    const path = EditableEditor.findPath(editor, node)

    // If the drop target is inside a void node, move it into either the
    // next or previous node, depending on which side the `x` and `y`
    // coordinates are closest to.
    if (Editor.isVoid(editor, node)) {
      const rect = target.getBoundingClientRect()
      const isPrev = editor.isInline(node)
        ? x - rect.left < rect.left + rect.width - x
        : y - rect.top < rect.top + rect.height - y

      const edge = Editor.point(editor, path, {
        edge: isPrev ? 'start' : 'end',
      })
      const point = isPrev
        ? Editor.before(editor, edge)
        : Editor.after(editor, edge)

      if (point) {
        const range = Editor.range(editor, point)
        return range
      }
    }

    // Else resolve a range from the caret position where the drop occured.
    let domRange
    const { document } = EditableEditor.getWindow(editor)

    // COMPAT: In Firefox, `caretRangeFromPoint` doesn't exist. (2016/07/25)
    if (document.caretRangeFromPoint) {
      domRange = document.caretRangeFromPoint(x, y)
    } else {
      const position = (document as any).caretPositionFromPoint(x, y)

      if (position) {
        domRange = document.createRange()
        domRange.setStart(position.offsetNode, position.offset)
        domRange.setEnd(position.offsetNode, position.offset)
      }
    }

    if (!domRange) {
      throw new Error(`Cannot resolve a Slate range from a DOM event: ${event}`)
    }

    // Resolve a Slate range from the DOM range.
    const range = EditableEditor.toSlateRange(editor, domRange, {
      exactMatch: false,
      suppressThrow: false,
    })
    return range
  },

  findLowestDOMElements(editor: EditableEditor, node: Node) {
    const domNode = EditableEditor.toDOMNode(editor, node)
    if(Editor.isVoid(editor, node)) return [domNode]
    const nodes = domNode.querySelectorAll('[data-slate-string], [data-slate-composition], [data-slate-zero-width]')
    return Array.from(nodes)
  },

  findClosestPoint(editor: EditableEditor, domNode: DOMNode, x: number, y: number): Point | null { 
    const domEl = isDOMElement(domNode) ? domNode : domNode.parentElement
    if(!domEl) return null
    const elements: DOMElement[] = []
    let element: DOMElement | null = domEl.hasAttribute('data-slate-node') ? domEl : domEl.closest(`[data-slate-node]`)

    const addToElements = (node: Node) => {
      const children = EditableEditor.findLowestDOMElements(editor, node)
      for(const child of children) {
        if(~elements.indexOf(child)) continue
          elements.push(child)
      }
    }
    
    if(!element) {
      const nodes = Node.nodes(editor)
      for(const [ node ] of nodes) {
        addToElements(node)
      }
    } else {
      const node = EditableEditor.toSlateNode(editor, element)
      if(Text.isText(node)) {
        addToElements(node)
      } else {
        const nodes = Node.nodes(node)
        for(const [ node ] of nodes) { 
          addToElements(node)
        }
      }
    }
    let top = y, left = x
    const nodes = findClosestNode(elements, x, y)
    console.log(elements, nodes, x, y)
    if(!nodes) return null
    let offsetNode: DOMElement | null = null
    if(isDOMNode(nodes)) {
      offsetNode = nodes
    } else {
      const { top: closestTop, left: closestLeft, right: closestRight, below: closestBelow } = nodes
      
      if(closestLeft && closestBelow) {
        if(isAlignY(closestBelow.rect, closestLeft.rect)) {
          offsetNode = closestBelow.node
          top = closestBelow.rect.top
        } else {
          offsetNode = closestLeft.node
          left = closestLeft.rect.right
        }
      } else if(closestRight && closestBelow) {
        if(isAlignY(closestBelow.rect, closestRight.rect)) {
          offsetNode = closestBelow.node
          top = closestBelow.rect.top
        } else {
          offsetNode = closestRight.node
          left = closestRight.rect.left
        }
      } else if(closestLeft) {
        offsetNode = closestLeft.node
        left = closestLeft.rect.right
      } else if(closestRight) {
        offsetNode = closestRight.node
        left = closestRight.rect.left
      } else if(closestBelow) {
        if(left < closestBelow.rect.left) {
          left = closestBelow.rect.left
        } else if(left > closestBelow.rect.right) { 
          left = closestBelow.rect.right
        }
        top = closestBelow.rect.top
        offsetNode = closestBelow.node
      } else if(closestTop) {
        offsetNode = closestTop.node
        if(left < closestTop.rect.left) {
          left = closestTop.rect.left
        } else if(left > closestTop.rect.right) { 
          left = closestTop.rect.right
        }
        top = closestTop.rect.bottom
      }
    }
    if(!offsetNode) return null
    console.log(offsetNode)
    const node = EditableEditor.toSlateNode(editor, offsetNode)
    if(Text.isText(node)) {
      const textNodes = EditableEditor.findLowestDOMElements(editor, node)
      let startOffset = 0
      for(let s = 0; s < textNodes.length; s++) { 
        const textNode = textNodes[s]
        if(textNode === offsetNode) break
        startOffset += (textNode.textContent ?? '').length
      }
      const textNode = isDOMText(offsetNode) ? offsetNode : offsetNode.firstChild
      if(!isDOMText(textNode)) return null
      const content = textNode.textContent ?? ''
      const offset = getTextOffset(textNode, left, top, 0, content.length, content.length)
      return {
        path: EditableEditor.findPath(editor, node),
        offset: startOffset + offset
      }
    } else if(Element.isElement(node)) {
      const point = EditableEditor.toSlatePoint(editor, [ offsetNode, 0 ], {
        exactMatch: false,
        suppressThrow: false,
      })
      return point
    }
    return null
  },
  /**
   * Get the target point from a DOM `event`.
   */
  findEventPoint(editor: EditableEditor, event: any): Point | null {
    if ('nativeEvent' in event) {
      event = event.nativeEvent
    }

    const { clientX: x, clientY: y, target } = event

    if (x == null || y == null) {
      throw new Error(`Cannot resolve a Slate range from a DOM event: ${event}`)
    }
    return EditableEditor.findClosestPoint(editor, target, x, y)
  },

  findPreviousLinePoint(editor: EditableEditor, at?: Range): Point | null { 
    const { selection } = editor
    if(!at && selection) at = selection
    if(!at) return null
    const domRange = EditableEditor.toDOMRange(editor, at)
    const startRange = domRange.cloneRange()
    startRange.collapse(true)
    const endRange = domRange.cloneRange()
    endRange.collapse(false)
    const isBackward = Range.isBackward(at)
    const startRect = (isBackward ? endRange : startRange).getClientRects()[0]
    const endRect = (isBackward ? startRange : endRange).getClientRects()[0]

    let blockEntry = Editor.above(editor, {
      at: at.focus,
      match: n => Editor.isBlock(editor, n),
    })
    let top = endRect.top
    let isFind = false
    let domBlock: DOMElement | null = null
    while(blockEntry && !isFind) {
      const [block, path] = blockEntry
      domBlock = EditableEditor.toDOMNode(editor, block)
      const lowestElements = EditableEditor.findLowestDOMElements(editor, block)
      for(let l = lowestElements.length - 1; l >=0 && !isFind; l--) {
        const lowestElement = lowestElements[l]
        const rects = lowestElement.getClientRects()
        for(let i = 0; i < rects.length; i++) {
          const rect = rects[i]
          if(rect.height === 0) continue
          if (rect.bottom <= top) {
            isFind = true
            top = rect.bottom - rect.height / 2;
            break
          }
        }
      }
      if(!isFind) {
        blockEntry = Editor.previous(editor, {
          at: path,
          match: n => Editor.isBlock(editor, n),
        })
      }
    }
    if(!domBlock ) return null
    return EditableEditor.findClosestPoint(editor, domBlock, isFind ? startRect.x : 0, top)
  },

  findNextLinePoint(editor: EditableEditor, at?: Range): Point | null { 
    const { selection } = editor
    if(!at && selection) at = selection
    if(!at) return null
    const domRange = EditableEditor.toDOMRange(editor, at)
    const startRange = domRange.cloneRange()
    startRange.collapse(true)
    const endRange = domRange.cloneRange()
    endRange.collapse(false)
    const isBackward = Range.isBackward(at)
    const startRect = (isBackward ? endRange : startRange).getClientRects()[0]
    const endRect = (isBackward ? startRange : endRange).getClientRects()[0]

    let blockEntry = Editor.above(editor, {
      at: at.focus,
      match: n => Editor.isBlock(editor, n),
    })
    let bottom = endRect.bottom
    let isFind = false
    let domBlock: DOMElement | null = null
    while(blockEntry && !isFind) {
      const [block, path] = blockEntry
      domBlock = EditableEditor.toDOMNode(editor, block)
      const lowestElements = EditableEditor.findLowestDOMElements(editor, block)
      for(let l = 0; l < lowestElements.length && !isFind; l++) {
        const lowestElement = lowestElements[l]
        const rects = lowestElement.getClientRects()
        for(let i = 0; i < rects.length; i++) {
          const rect = rects[i]
          if(rect.height === 0) continue
          if (rect.top >= bottom) {
            isFind = true
            bottom = rect.top + rect.height / 2;
            break
          }
        }
      }
      if(!isFind) {
        blockEntry = Editor.next(editor, {
          at: path,
          match: n => Editor.isBlock(editor, n),
        })
      }
    }
    if(!domBlock ) return null
    
    return EditableEditor.findClosestPoint(editor, domBlock, isFind ? startRect.x : 99999, bottom)
  },

  findTextOffsetOnLine(editor: EditableEditor, point: Point) { 
    const blockEntry = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
      at: point,
    })
    const data = {
      text: '',
      offset: 0
    }
    if(!blockEntry) {
      throw new Error(`Cannot resolve a Slate block from a point: ${point}`)
    }
    const textNodes = Node.texts(blockEntry[0])
    let isFindOffset = false
    for(const [textNode, textPath] of textNodes) {
      const { text } = textNode
      if(Path.equals(blockEntry[1].concat(textPath), point.path)) {
        data.offset += point.offset
        isFindOffset = true
      } else if(!isFindOffset) {
        data.offset += text.length
      }
      data.text += text
    }
    return data
  },

  findPointOnLine(editor: EditableEditor, path: Path, offset: number, moveNext: boolean = false) {
    const blockEntry = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
      at: path,
    })
    if(!blockEntry) {
      throw new Error(`Cannot resolve a Slate block from a path: ${path}`)
    }
    const textNodes = Node.texts(blockEntry[0])
    let findOffset = 0;
    for(const [textNode, textPath] of textNodes) {
      const { text } = textNode
      const textLength = text.length
      const totalOffset = findOffset + textLength
      if(totalOffset >= offset) {
        const path = blockEntry[1].concat(textPath)
        if(moveNext && offset > 0 && totalOffset === offset) {
          const next = Editor.next(editor, {
            at: path,
          })
          if(next) {
            return {
              path: next[1],
              offset: 0
            }
          }
        }
        return {path: blockEntry[1].concat(textPath), offset: textLength - (totalOffset - offset)}
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
    editor: EditableEditor,
    domPoint: DOMPoint,
    options: {
      exactMatch: T
      suppressThrow: T
    }
  ): T extends true ? Point | null : Point {
    const { exactMatch, suppressThrow } = options
    const [nearestNode, nearestOffset] = exactMatch
      ? domPoint
      : normalizeDOMPoint(domPoint)
    const parentNode = nearestNode.parentNode as DOMElement
    let textNode: DOMElement | null = null
    let offset = 0

    if (parentNode) {
      const editorEl = EditableEditor.toDOMNode(editor, editor)
      const potentialVoidNode = parentNode.closest('[data-slate-void="true"]')
      // Need to ensure that the closest void node is actually a void node
      // within this editor, and not a void node within some parent editor. This can happen
      // if this editor is within a void node of another editor ("nested editors", like in
      // the "Editable Voids" example on the docs site).
      const voidNode =
        potentialVoidNode && editorEl.contains(potentialVoidNode)
          ? potentialVoidNode
          : null
      let leafNode = parentNode.closest('[data-slate-leaf]')
      let offsetNode: DOMElement | null = null

      // Calculate how far into the text node the `nearestNode` is, so that we
      // can determine what the offset relative to the text node is.
      if (leafNode) {
        textNode = leafNode.closest('[data-slate-node="text"]')

        if (textNode) {
          const window = EditableEditor.getWindow(editor)
          const range = window.document.createRange()
          range.setStart(textNode, 0)
          range.setEnd(nearestNode, nearestOffset)

          const contents = range.cloneContents()
          const removals = [
            ...Array.prototype.slice.call(
              contents.querySelectorAll('[data-slate-zero-width]')
            ),
            ...Array.prototype.slice.call(
              contents.querySelectorAll('[contenteditable=false]')
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
        leafNode = voidNode.querySelector('[data-slate-leaf]')!

        // COMPAT: In read-only editors the leaf is not rendered.
        if (!leafNode) {
          offset = 1
        } else {
          textNode = leafNode.closest('[data-slate-node="text"]')!
          offsetNode = leafNode
          offset = offsetNode.textContent!.length
          offsetNode.querySelectorAll('[data-slate-zero-width]').forEach(el => {
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
        (parentNode.hasAttribute('data-slate-zero-width') ||
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
      throw new Error(
        `Cannot resolve a Slate point from DOM point: ${domPoint}`
      )
    }

    // COMPAT: If someone is clicking from one Slate editor into another,
    // the select event fires twice, once for the old editor's `element`
    // first, and then afterwards for the correct `element`. (2017/03/03)
    const slateNode = EditableEditor.toSlateNode(editor, textNode!)
    const path = EditableEditor.findPath(editor, slateNode)
    return { path, offset } as T extends true ? Point | null : Point
  },

  /**
   * Find a Slate range from a DOM range or selection.
   */

  toSlateRange<T extends boolean>(
    editor: EditableEditor,
    domRange: DOMRange | DOMStaticRange | DOMSelection,
    options: {
      exactMatch: T
      suppressThrow: T
    }
  ): T extends true ? Range | null : Range {
    const { exactMatch, suppressThrow } = options
    const el = isDOMSelection(domRange)
      ? domRange.anchorNode
      : domRange.startContainer
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

    if (
      anchorNode == null ||
      focusNode == null ||
      anchorOffset == null ||
      focusOffset == null
    ) {
      throw new Error(
        `Cannot resolve a Slate range from DOM range: ${domRange}`
      )
    }

    const anchor = EditableEditor.toSlatePoint(
      editor,
      [anchorNode, anchorOffset],
      { exactMatch, suppressThrow }
    )
    if (!anchor) {
      return null as T extends true ? Range | null : Range
    }

    const focus = isCollapsed
      ? anchor
      : EditableEditor.toSlatePoint(editor, [focusNode, focusOffset], {
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

    return (range as unknown) as T extends true ? Range | null : Range
  },

  hasRange(editor: EditableEditor, range: Range): boolean {
    const { anchor, focus } = range
    return (
      Editor.hasPath(editor, anchor.path) && Editor.hasPath(editor, focus.path)
    )
  },
}
