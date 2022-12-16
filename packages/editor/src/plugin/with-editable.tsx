import ReactDOM from 'react-dom'
import {
  Editor,
  Node,
  Path,
  Operation,
  Transforms,
  Range,
  Text,
  Element,
  EditorMarks,
  Point,
} from 'slate'
import getDirection from 'direction'
import { Editable, EditorElements, RenderElementProps, RenderLeafProps } from './editable'
import { Key } from '../utils/key'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  NODE_TO_KEY,
  IS_SHIFT_PRESSED,
  IS_COMPOSING,
  EDITOR_TO_INPUT,
  EDITOR_TO_SHADOW,
} from '../utils/weak-maps'
import { findCurrentLineRange } from '../utils/lines'
import Hotkeys from '../utils/hotkeys'
import { getWordOffsetBackward, getWordOffsetForward } from '../utils/text'
import { Grid } from '../interfaces/grid'
import { GridRow } from '../interfaces/row'
import { GridCell } from '../interfaces/cell'
import { List } from '../interfaces/list'
import { fragmentToString, parseDataTransfer } from '../utils/data-transfer'
import {
  APPLICATION_FRAGMENT_TYPE,
  DATA_EDITABLE_FRAGMENT,
  TEXT_HTML,
  TEXT_PLAIN,
} from '../utils/constants'
import { readClipboardData, writeClipboardData } from '../utils/clipboard'
import { HTMLSerializer, TextSerializer } from './serializer'
import { HTMLDeserializer } from './deserializer'
import { CompositionText } from '../interfaces/composition-text'
import { EventEmitter } from './event'
import { Placeholder } from './placeholder'
import { Focused } from '../hooks/use-focused'

const EDITOR_ACTIVE_MARKS = new WeakMap<Editor, EditorMarks>()

const EDITOR_ACTIVE_ELEMENTS = new WeakMap<Editor, EditorElements>()

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
  const { apply, onChange, deleteBackward, deleteForward, normalizeNode } = e

  // The WeakMap which maps a key to a specific HTMLElement must be scoped to the editor instance to
  // avoid collisions between editors in the DOM that share the same value.
  EDITOR_TO_KEY_TO_ELEMENT.set(e, new WeakMap())

  e.isSolidVoid = (_element: Element) => {
    return true
  }

  e.isGrid = (value: any): value is Grid => false

  e.isGridRow = (value: any): value is GridRow => false

  e.isGridCell = (value: any): value is GridCell => false

  e.isList = (value: any): value is List => false

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
      const list = List.find(e)
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

    EDITOR_ACTIVE_MARKS.delete(editor)
    EDITOR_ACTIVE_ELEMENTS.delete(editor)

    if (!Editable.isFocused(e)) {
      e.focus()
    }

    apply(op)

    for (const [path, key] of matches) {
      const [node] = Editor.node(e, path)
      NODE_TO_KEY.set(node, key)
    }
  }

  e.normalizeNode = entry => {
    const [node, path] = entry
    if (Editor.isBlock(e, node)) {
      const { type, ...attributes } = node
      let isUnwrap = false
      const isParagraph = !type || type === 'paragraph'
      // 相同type类的block不嵌套，paragraph 下不能嵌套block节点
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Editor.isBlock(e, child)) {
          if (!isUnwrap && !isParagraph && child.type === type) {
            Transforms.unwrapNodes(editor, { at: childPath })
            return
          } else if (isParagraph) {
            Transforms.setNodes(editor, attributes, { at: childPath })
            isUnwrap = true
          }
        }
      }
      if (isUnwrap) {
        Transforms.unwrapNodes(editor, { at: path })
        return
      }

      if (e.isGrid(node) || e.isVoid(node)) {
        const parent = Node.parent(editor, path)
        if (parent.children[parent.children.length - 1] === node) {
          Transforms.insertNodes(
            editor,
            { type: 'paragraph', children: [{ text: '' }] },
            { at: Path.next(path) },
          )
        }
      }
    }
    normalizeNode(entry)
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

  e.onChange = () => {
    let prevSelection: Range | null = null
    EDITOR_ACTIVE_MARKS.delete(editor)
    EDITOR_ACTIVE_ELEMENTS.delete(editor)
    // COMPAT: React doesn't batch `setState` hook calls, which means that the
    // children and selection can get out of sync for one render pass. So we
    // have to use this unstable API to ensure it batches them. (2019/12/03)
    // https://github.com/facebook/react/issues/14259#issuecomment-439702367
    ReactDOM.unstable_batchedUpdates(() => {
      if (
        ((!prevSelection || !e.selection) && prevSelection !== e.selection) ||
        (prevSelection && e.selection && !Range.equals(prevSelection, e.selection))
      ) {
        e.onSelectionChange()
        prevSelection = e.selection ? Object.assign({}, e.selection) : null
      }
      Placeholder.clearCurrent(e)
      if (e.selection && Range.isCollapsed(e.selection) && Focused.is(e)) {
        const nodes = Editor.nodes(e, {
          at: e.selection,
        })
        for (const entry of nodes) {
          if (Editable.isEmpty(e, entry[0])) {
            Placeholder.setCurrent(e, entry)
            break
          }
        }
      } else if (Editable.isEmpty(e, e)) {
        Placeholder.setCurrent(e, [e, []])
      }

      onChange()
      e.emit('change')
    })
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
  e.focus = (): void => {
    const shadow = EDITOR_TO_SHADOW.get(editor)
    const textarea = EDITOR_TO_INPUT.get(editor)
    if (textarea && shadow && shadow.activeElement !== textarea) {
      textarea.focus({ preventScroll: true })
    }
  }

  e.queryActiveMarks = <T extends Text>() => {
    const marks = EDITOR_ACTIVE_MARKS.get(editor)
    if (marks) return marks as Omit<T, 'text'>
    const editorMarks: Omit<T, 'text'> = Editor.marks(e) as any
    if (editorMarks) EDITOR_ACTIVE_MARKS.set(editor, editorMarks)
    return editorMarks ?? {}
  }

  e.queryActiveElements = () => {
    let elements = EDITOR_ACTIVE_ELEMENTS.get(editor)
    if (elements) return elements
    elements = {}
    e.normalizeSelection(selection => {
      if (!elements || selection === null) return
      const nodeEntries = Editor.nodes<Element>(editor, {
        at: selection,
        match: n => !Editor.isEditor(n) && Element.isElement(n),
      })

      for (const entry of nodeEntries) {
        const type = entry[0].type ?? 'paragraph'
        if (elements[type]) elements[type].push(entry)
        else elements[type] = [entry]
      }
    })

    if (Object.keys(elements).length > 0) EDITOR_ACTIVE_ELEMENTS.set(editor, elements)
    return elements
  }

  let isPasteText = false
  e.onKeydown = (event: KeyboardEvent) => {
    e.emit('keydown', event)
    if (event.defaultPrevented) return
    const { selection } = editor
    const element = editor.children[selection !== null ? selection.focus.path[0] : 0]
    const isRTL = getDirection(Node.string(element)) === 'rtl'

    if (Hotkeys.isShift(event)) {
      IS_SHIFT_PRESSED.set(e, true)
    }

    if (Hotkeys.isCut(event)) {
      event.preventDefault()
      e.cut()
      return
    }

    if (Hotkeys.isCopy(event)) {
      event.preventDefault()
      e.copy()
      return
    }

    if (Hotkeys.isPaste(event)) {
      isPasteText = false
      return
    }

    if (Hotkeys.isPasteText(event)) {
      isPasteText = true
      return
    }

    if (Hotkeys.isExtendForward(event)) {
      event.preventDefault()
      Transforms.move(e, { edge: 'focus' })
      return
    }

    if (Hotkeys.isExtendBackward(event)) {
      event.preventDefault()
      Transforms.move(e, { edge: 'focus', reverse: true })
      return
    }

    if (Hotkeys.isExtendUp(event)) {
      event.preventDefault()
      const point = Editable.findPreviousLinePoint(e)
      if (point && selection)
        Transforms.select(editor, {
          anchor: selection.anchor,
          focus: point,
        })
      return
    }

    if (Hotkeys.isExtendDown(event)) {
      event.preventDefault()
      const point = Editable.findNextLinePoint(e)
      if (point && selection)
        Transforms.select(editor, {
          anchor: selection.anchor,
          focus: point,
        })
      return
    }

    if (Hotkeys.isMoveUp(event)) {
      event.preventDefault()
      const point = Editable.findPreviousLinePoint(e)
      if (point) Transforms.select(editor, point)
      return
    }

    if (Hotkeys.isMoveDown(event)) {
      event.preventDefault()
      const point = Editable.findNextLinePoint(e)
      if (point) Transforms.select(editor, point)
      return
    }

    if (Hotkeys.isExtendLineBackward(event)) {
      event.preventDefault()
      Transforms.move(e, {
        unit: 'line',
        edge: 'focus',
        reverse: true,
      })
      return
    }

    if (Hotkeys.isExtendLineForward(event)) {
      event.preventDefault()
      Transforms.move(e, { unit: 'line', edge: 'focus' })
      return
    }

    if (Hotkeys.isMoveWordBackward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Transforms.collapse(editor, { edge: 'focus' })
      }
      if (selection) {
        const { focus } = selection
        const { path: focusPath } = focus
        if (Editor.isStart(editor, focus, focusPath)) {
          Transforms.move(e, { reverse: !isRTL })
          return
        }
        const { text, offset } = Editable.findTextOffsetOnLine(e, focus)
        if (text) {
          const wordOffset = getWordOffsetBackward(text, offset)
          const newPoint = Editable.findPointOnLine(e, focusPath, wordOffset)
          Transforms.select(editor, newPoint)
          return
        }
      }
      Transforms.move(e, { unit: 'word', reverse: !isRTL })
      return
    }

    if (Hotkeys.isMoveWordForward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Transforms.collapse(editor, { edge: 'focus' })
      }
      if (selection) {
        const { focus } = selection
        const { path: focusPath } = focus
        if (Editor.isEnd(editor, focus, focusPath)) {
          Transforms.move(e, { reverse: isRTL })
          return
        }
        const { text, offset } = Editable.findTextOffsetOnLine(e, focus)
        if (text) {
          const wordOffset = getWordOffsetForward(text, offset)
          Transforms.select(editor, Editable.findPointOnLine(e, focusPath, wordOffset))
          return
        }
      }
      Transforms.move(e, { unit: 'word', reverse: isRTL })
      return
    }

    if (Hotkeys.isMoveBackward(event)) {
      event.preventDefault()

      if (selection && Range.isCollapsed(selection)) {
        Transforms.move(e, { reverse: !isRTL })
      } else {
        Transforms.collapse(editor, { edge: 'start' })
      }

      return
    }

    if (Hotkeys.isMoveForward(event)) {
      event.preventDefault()

      if (selection && Range.isCollapsed(selection)) {
        Transforms.move(e, { reverse: isRTL })
      } else {
        Transforms.collapse(editor, { edge: 'end' })
      }

      return
    }

    if (Hotkeys.isSoftBreak(event)) {
      event.preventDefault()
      Editor.insertSoftBreak(editor)
      return
    }

    if (Hotkeys.isSplitBlock(event)) {
      event.preventDefault()
      Editor.insertBreak(editor)
      return
    }

    if (Hotkeys.isDeleteBackward(event)) {
      event.preventDefault()
      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor)
      } else {
        Editor.deleteBackward(editor)
      }
      return
    }

    if (Hotkeys.isDeleteForward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'forward' })
      } else {
        Editor.deleteForward(editor)
      }

      return
    }

    if (Hotkeys.isDeleteLineBackward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'backward' })
      } else {
        Editor.deleteBackward(editor, { unit: 'line' })
      }

      return
    }

    if (Hotkeys.isDeleteLineForward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'forward' })
      } else {
        Editor.deleteForward(editor, { unit: 'line' })
      }

      return
    }

    if (Hotkeys.isDeleteWordBackward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'backward' })
      } else {
        Editor.deleteBackward(editor, { unit: 'word' })
      }

      return
    }

    if (Hotkeys.isDeleteWordForward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'forward' })
      } else {
        Editor.deleteForward(editor, { unit: 'word' })
      }

      return
    }
  }

  e.onKeyup = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === 'shift') {
      IS_SHIFT_PRESSED.set(editor, false)
    }
    e.emit('keyup', event)
  }

  e.onFocus = () => {
    e.focus()
    e.emit('focus')
  }

  e.onBlur = () => {
    e.emit('blur')
  }

  e.onInput = (value: string) => {
    const { selection, marks } = editor
    if (!selection) return
    if (IS_COMPOSING.get(e)) {
      let [node, path] = Editor.node(editor, selection)
      if (marks) {
        // 使用零宽字符绕过slate里面不能插入空字符的问题。组合输入法完成后会删除掉
        const compositionText: CompositionText = {
          text: '\u200b',
          ...marks,
          composition: {
            text: value,
            offset: 0,
            isEmpty: true,
          },
        }
        Transforms.insertNodes(editor, compositionText)
        e.marks = null
      } else if (Text.isText(node)) {
        if (Range.isExpanded(selection)) {
          Editor.deleteFragment(editor)
        }
        const composition = CompositionText.isCompositionText(node) ? node.composition : null
        const offset = composition?.offset ?? selection.anchor.offset

        Transforms.setNodes<CompositionText>(
          editor,
          {
            composition: {
              ...composition,
              text: value,
              offset,
            },
          },
          { at: path },
        )
        const point = { path, offset: offset + value.length }
        Transforms.select(editor, {
          anchor: point,
          focus: point,
        })
      }
    } else {
      editor.insertText(value)
    }
    e.emit('input', value)
  }

  e.onBeforeInput = value => {
    e.emit('beforeinput', value)
  }

  e.onCompositionStart = data => {
    IS_COMPOSING.set(editor, true)
    e.emit('compositionstart', data)
  }

  e.onCompositionEnd = (value: string) => {
    const { selection } = editor
    if (!selection) return
    const [node, path] = Editor.node(editor, selection)
    if (Text.isText(node)) {
      const composition = CompositionText.isCompositionText(node) ? node.composition : null
      Transforms.setNodes<CompositionText>(
        editor,
        {
          composition: undefined,
        },
        { at: path },
      )
      const point = { path, offset: composition?.offset ?? selection.anchor.offset }
      const range = composition?.isEmpty
        ? {
            anchor: { path, offset: 0 },
            focus: { path, offset: 1 },
          }
        : point

      IS_COMPOSING.set(editor, false)
      Transforms.select(editor, range)
      Transforms.insertText(editor, value)
    }
    e.emit('compositionend', value)
  }

  e.onCut = event => {
    if (event.defaultPrevented) return
    const { selection } = e
    const { clipboardData } = event
    if (clipboardData) writeClipboardData(clipboardData)
    if (selection) {
      if (Range.isExpanded(selection)) {
        Editor.deleteFragment(e)
      } else {
        const node = Node.parent(e, selection.anchor.path)
        if (Editor.isVoid(e, node)) {
          Transforms.delete(e)
        }
      }
    }
    e.emit('cut', event)
  }

  e.onCopy = event => {
    if (event.defaultPrevented) return
    const { clipboardData } = event
    if (clipboardData) writeClipboardData(clipboardData)
    e.emit('copy', event)
  }

  e.onPaste = event => {
    if (event.defaultPrevented) return
    const { clipboardData } = event
    if (!clipboardData) return
    event.preventDefault()
    const { text, fragment, html } = parseDataTransfer(clipboardData)
    if (!isPasteText && fragment.length > 0) {
      e.insertFragment(fragment)
    } else if (!isPasteText && html) {
      const document = new DOMParser().parseFromString(html, TEXT_HTML)
      const fragment = HTMLDeserializer.transformWithEditor(e, document.body)
      e.insertFragment(fragment)
    } else {
      const lines = text.split(/\r\n|\r|\n/)
      let split = false

      for (const line of lines) {
        if (split) {
          Transforms.splitNodes(e, { always: true })
        }
        e.normalizeSelection(selection => {
          if (selection !== e.selection) e.selection = selection
          e.insertText(line)
        })
        split = true
      }
    }
    e.emit('paste', event)
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
    const Tag = e.isInline(element) ? 'span' : 'div'
    return <Tag {...attributes}>{children}</Tag>
  }

  e.renderLeaf = (props: RenderLeafProps) => {
    const { attributes, children } = props
    return <span {...attributes}>{children}</span>
  }

  e.renderPlaceholder = ({ attributes, children }) => {
    return (
      <span style={{ pointerEvents: 'none', userSelect: 'none', position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            opacity: '0.333',
            width: 'fit-content',
            whiteSpace: 'nowrap',
          }}
          {...attributes}
        >
          {children}
        </span>
      </span>
    )
  }

  e.normalizeSelection = fn => {
    const { selection } = e
    const grid = Grid.find(e)
    if (grid && selection) {
      const sel = Grid.getSelection(e, grid)
      if (sel) {
        let { start, end } = sel
        const [startRow, startCol] = start
        const [endRow, endCol] = end

        const rowCount = endRow - startRow
        const colCount = endCol - startCol

        if (rowCount > 0 || colCount > 0) {
          const [, path] = grid
          const edgesSelection = Grid.edges(e, grid, sel)
          const { start: edgeStart, end: edgeEnd } = edgesSelection
          const cells = Grid.cells(e, grid, {
            startRow: edgeStart[0],
            startCol: edgeStart[1],
            endRow: edgeEnd[0],
            endCol: edgeEnd[1],
          })

          for (const [cell, row, col] of cells) {
            if (!cell) break
            if (!cell.span) {
              const range = Editor.range(editor, path.concat([row, col]))
              fn(range, { grid, row, col })
            }
          }
          // 恢复选区
          Transforms.select(e, selection)
          return
        }
      }
    }
    fn(selection)
  }

  e.getFragment = (range?: Range) => {
    const selection = range ?? e.selection
    if (!selection) return []
    const grid = Grid.find(e)
    if (grid) {
      const sel = Grid.getSelection(e, grid)
      const selected = Grid.getSelected(e, grid, sel)
      if (selected) {
        const { colFull, rowFull, cols, rows } = selected
        if (colFull || rowFull || cols.length > 1 || rows.length > 1) {
          const fragment = Grid.getFragment(e, grid, sel)
          return fragment ? [fragment] : []
        } else if (cols.length === 1 || rows.length === 1) {
          const cell = Grid.getCell(e, grid, [rows[0], cols[0]])
          if (cell) {
            const { anchor, focus } = selection
            const [n, p] = cell
            return Node.fragment(n, {
              anchor: {
                path: anchor.path.slice(p.length),
                offset: anchor.offset,
              },
              focus: {
                path: focus.path.slice(p.length),
                offset: focus.offset,
              },
            })
          }
        }
      }
    }
    return Node.fragment(e, selection)
  }

  const { insertBreak } = e
  e.insertBreak = () => {
    const { selection } = editor

    if (!Editable.isEditor(editor) || !selection || Range.isExpanded(selection)) {
      insertBreak()
      return
    }
    const entrie = Editor.above<List>(editor, {
      match: n => editor.isList(n),
    })
    if (!entrie) {
      insertBreak()
      return
    }
    List.splitList(editor)
  }

  e.getDataTransfer = range => {
    const fragment = e.getFragment(range)
    const fragmentString = fragmentToString(fragment)

    const text = fragment.map(node => TextSerializer.transformWithEditor(e, node)).join('\n')

    let html = fragment.map(node => HTMLSerializer.transformWithEditor(e, node)).join('')
    html = `<div ${DATA_EDITABLE_FRAGMENT}="${fragmentString}">${html}</div>`
    html = `<html><head><meta name="source" content="${DATA_EDITABLE_FRAGMENT}" /></head><body>${html}</body></html>`
    const dataTransfer = new DataTransfer()
    dataTransfer.setData(TEXT_PLAIN, text)
    dataTransfer.setData(TEXT_HTML, html)
    dataTransfer.setData(APPLICATION_FRAGMENT_TYPE, fragmentString)
    return dataTransfer
  }

  e.copy = range => {
    const data = e.getDataTransfer(range)
    const event = new ClipboardEvent('copy', { clipboardData: data })
    e.onCopy(event)
  }

  e.cut = range => {
    const data = e.getDataTransfer(range)
    const event = new ClipboardEvent('copy', { clipboardData: data })
    if (range) {
      Transforms.select(e, range)
    }
    e.onCut(event)
  }

  e.paste = range => {
    if (range) {
      Transforms.select(e, range)
    }
    readClipboardData().then(data => {
      const event = new ClipboardEvent('paste', { clipboardData: data })
      e.onPaste(event)
    })
  }

  e.pasteText = range => {
    if (range) {
      Transforms.select(e, range)
    }
    readClipboardData().then(data => {
      isPasteText = true
      const event = new ClipboardEvent('paste-text', { clipboardData: data })
      e.onPaste(event)
    })
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
