import {
  Editor,
  Node,
  Path,
  Operation,
  Transforms,
  Range,
  Point,
  List,
  Key,
} from '@editablejs/models'
import { Editable, RenderElementProps, RenderLeafProps } from './editable'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  NODE_TO_KEY,
  IS_SHIFT_PRESSED,
  EDITOR_TO_INPUT,
  EDITOR_TO_SHADOW,
} from '../utils/weak-maps'
import { findCurrentLineRange } from '../utils/lines'
import { EventEmitter } from './event'
import { Placeholder } from './placeholder'
import { Focused } from '../hooks/use-focused'
import { canForceTakeFocus } from '../utils/dom'
import { withInput } from './with-input'
import { withKeydown } from './with-keydown'
import { withNormalizeNode } from './with-normalize-node'
import { withDataTransfer } from './with-data-transfer'
import { getWordRange } from '../utils/text'
import { ReadOnly } from '../hooks/use-read-only'
import { html, render } from 'rezon'
import { spread } from 'rezon/directives/spread'
import { styleMap } from 'rezon/directives/style-map'
import { ContentEditable } from '../components/content'

/**
 * `withEditable` adds React and DOM specific behaviors to the editor.
 *
 * If you are using TypeScript, you must extend Slate's CustomTypes to use
 * this plugin.
 *
 * See https://docs.slatejs.org/concepts/11-typescript to learn how.
 */
export const withEditable = <T extends Editor>(editor: T) => {
  const e = editor as T & Editable

  withInput(e)

  withKeydown(e)

  withNormalizeNode(e)

  withDataTransfer(e)

  const { apply, onChange, deleteBackward, deleteForward } = e

  // The WeakMap which maps a key to a specific HTMLElement must be scoped to the editor instance to
  // avoid collisions between editors in the DOM that share the same value.
  EDITOR_TO_KEY_TO_ELEMENT.set(e, new WeakMap())

  e.deleteForward = unit => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n => e.isGridCell(n),
      })

      if (cell) {
        const [, cellPath] = cell
        const end = Editor.end(editor, cellPath)
        if (Point.equals(selection.anchor, end)) {
          return
        }
      }
    }
    deleteForward(unit)
  }

  e.deleteBackward = unit => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n => e.isGridCell(n),
      })

      if (cell) {
        const [, cellPath] = cell
        const start = Editor.start(editor, cellPath)

        if (Point.equals(selection.anchor, start)) {
          return
        }
      }
      const list = List.above(e)
      if (list && Editor.isStart(e, selection.focus, list[1])) {
        List.unwrapList(e)
        return
      }
    }
    if (unit !== 'line') {
      return deleteBackward(unit)
    }

    if (selection && Range.isCollapsed(selection)) {
      const parentBlockEntry = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
        at: selection,
      })

      if (parentBlockEntry) {
        const [, parentBlockPath] = parentBlockEntry
        const parentElementRange = Editor.range(editor, parentBlockPath, selection.anchor)

        const currentLineRange = findCurrentLineRange(e, parentElementRange)

        if (!Range.isCollapsed(currentLineRange)) {
          Transforms.delete(editor, { at: currentLineRange })
        }
      }
    }
  }

  // This attempts to reset the NODE_TO_KEY entry to the correct value
  // as apply() changes the object reference and hence invalidates the NODE_TO_KEY entry
  e.apply = (op: Operation) => {
    const matches: [Path, Key][] = []

    switch (op.type) {
      case 'insert_text':
      case 'remove_text':
      case 'set_node':
      case 'split_node': {
        matches.push(...getMatches(e, op.path))
        break
      }

      case 'set_selection': {
        break
      }

      case 'insert_node':
      case 'remove_node': {
        matches.push(...getMatches(e, Path.parent(op.path)))
        break
      }

      case 'merge_node': {
        const prevPath = Path.previous(op.path)
        matches.push(...getMatches(e, prevPath))
        break
      }

      case 'move_node': {
        const commonPath = Path.common(Path.parent(op.path), Path.parent(op.newPath))
        matches.push(...getMatches(e, commonPath))
        break
      }
    }

    apply(op)

    for (const [path, key] of matches) {
      const [node] = Editor.node(e, path)
      NODE_TO_KEY.set(node, key)
    }
    if (!Editable.isFocused(e) && canForceTakeFocus()) {
      e.focus()
    }
  }

  e.on = (type, handler, prepend) => {
    EventEmitter.on(e, type, handler, prepend)
  }

  e.off = (type, handler) => {
    EventEmitter.off(e, type, handler)
  }

  e.once = (type, handler, prepend) => {
    EventEmitter.on(e, type, handler, prepend)
  }

  e.emit = (type, ...args) => {
    EventEmitter.emit(e, type, ...args)
  }

  let prevSelection: Range | null = null
  let prevAnchorNode: Node | null = null
  let prevFocusNode: Node | null = null

  e.onChange = () => {
    if (
      ((!prevSelection || !e.selection) && prevSelection !== e.selection) ||
      (prevSelection &&
        e.selection &&
        (!Range.equals(prevSelection, e.selection) ||
          prevAnchorNode !== Node.get(e, e.selection.anchor.path) ||
          prevFocusNode !== Node.get(e, e.selection.focus.path)))
    ) {
      e.onSelectionChange()
      prevSelection = e.selection ? Object.assign({}, e.selection) : null
      prevAnchorNode = e.selection ? Node.get(e, e.selection.anchor.path) : null
      prevFocusNode = e.selection ? Node.get(e, e.selection.focus.path) : null
    }
    Placeholder.refresh(e)
    onChange()
    e.emit('change')
  }

  e.blur = (): void => {
    const shadow = EDITOR_TO_SHADOW.get(editor)
    const textarea = EDITOR_TO_INPUT.get(editor)
    if (textarea && shadow && shadow.activeElement !== textarea) {
      textarea.blur()
    }
  }
  /**
   * Focus the editor.
   */
  e.focus = (start): void => {
    if (!editor.selection) {
      const path = Editable.findPath(e, e)
      const point = start ? Editor.start(e, path) : Editor.end(e, path)
      Transforms.select(e, point)
    } else if (start === true) {
      const path = Editable.findPath(e, e)
      Transforms.select(e, Editor.start(e, path))
    } else if (start === false) {
      const path = Editable.findPath(e, e)
      Transforms.select(e, Editor.end(e, path))
    }

    const shadow = EDITOR_TO_SHADOW.get(editor)
    const textarea = EDITOR_TO_INPUT.get(editor)
    if (textarea && shadow && shadow.activeElement !== textarea) {
      textarea.focus({ preventScroll: true })
    }
  }

  e.selectWord = (options = {}) => {
    const { at, edge = 'focus' } = options
    if (at) {
      Transforms.select(e, at)
    }
    const { selection } = e
    if (!selection) return
    const point = ['focus', 'end'].includes(edge) ? Range.end(selection) : Range.start(selection)
    const { text, offset } = Editable.findTextOffsetOnLine(e, point)
    if (text) {
      const { path } = point
      const [startOffset, endOffset] = getWordRange(text, offset)
      Transforms.select(e, {
        anchor: Editable.findPointOnLine(e, path, startOffset, true),
        focus: Editable.findPointOnLine(e, path, endOffset),
      })
      e.onSelectEnd()
    }
  }

  e.selectLine = (options = {}) => {
    const { at, edge = 'focus' } = options
    if (at) {
      Transforms.select(e, at)
    }
    const { selection } = e
    if (!selection) return
    const point = ['focus', 'end'].includes(edge) ? Range.end(selection) : Range.start(selection)
    const { path } = point
    const node = Node.get(e, path)
    let linePath = path
    if (!Editor.isBlock(e, node)) {
      const block = Editor.above(e, {
        match: n => Editor.isBlock(e, n),
        at: path,
      })

      linePath = block?.[1] ?? path.slice(0, 1)
    }

    const range = Editor.range(e, linePath)
    Transforms.select(e, range)
    e.onSelectEnd()
  }

  e.onKeyup = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === 'shift') {
      IS_SHIFT_PRESSED.set(editor, false)
    }
    e.emit('keyup', event)
  }

  e.onFocus = () => {
    e.focus()
    Placeholder.refresh(e)
    e.emit('focus')
  }

  e.onBlur = () => {
    Placeholder.refresh(e)
    e.emit('blur')
  }

  e.onSelectStart = () => {
    e.emit('selectstart')
  }

  e.onSelecting = () => {
    e.emit('selecting')
  }

  e.onSelectEnd = () => {
    e.emit('selectend')
  }

  e.onSelectionChange = () => {
    e.emit('selectionchange')
  }

  e.onTouchHold = event => {
    e.emit('touchhold', event)
  }

  e.onTouchTrack = () => {
    e.emit('touchtrack')
  }

  e.onContextMenu = event => {
    e.emit('contextmenu', event)
  }

  e.onDestory = () => {
    e.emit('destory')
  }

  e.renderElementAttributes = ({ attributes }) => {
    return attributes
  }

  e.renderLeafAttributes = ({ attributes }) => {
    return attributes
  }

  e.renderElement = (props: RenderElementProps) => {
    const { attributes, children, element } = props
    return e.isInline(element)
      ? html`<span ${spread(attributes)}>${children}</span>`
      : html`<div ${spread(attributes)}>${children}</div>`
  }

  e.renderLeaf = (props: RenderLeafProps) => {
    const { attributes, children } = props
    return html`<span ${spread(attributes)}>${children}</span>`
  }

  e.renderPlaceholder = ({ attributes, children }) => {
    return html`<span style="pointer-events:none;user-select:none;width:100%;">
      <span
        style="position:absolute;opacity:0.333;width:fit-content;white-space:nowrap;text-indent:initial;text-overflow:ellipsis;max-width:100%;overflow:hidden;"
        ${spread(attributes)}
        >${children}</span
      >
    </span>`
  }

  e.render = (editor, container, options) => {
    render(ContentEditable({
      placeholder: 'Enter some text...',
    }), container)
  }

  const { insertBreak } = e

  e.insertBreak = () => {
    const { selection } = editor

    if (!Editable.isEditor(editor) || !selection || Range.isExpanded(selection)) {
      insertBreak()
      return
    }
    const entrie = List.above(editor)
    if (!entrie) {
      insertBreak()
      return
    }
    List.splitList(editor)
  }

  e.insertFile = (_, range) => {
    if (range) {
      Transforms.select(e, range)
    }
  }

  return e
}

const getMatches = (e: Editable, path: Path) => {
  const matches: [Path, Key][] = []
  for (const [n, p] of Editor.levels(e, { at: path })) {
    const key = Editable.findKey(e, n)
    matches.push([p, key])
  }
  return matches
}
