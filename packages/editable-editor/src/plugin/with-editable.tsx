import ReactDOM from 'react-dom'
import { Editor, Node, Path, Operation, Transforms, Range, Text, Element, EditorMarks, Point } from 'slate'
import getDirection from 'direction'
import { Editable, EditorElements, RenderElementProps, RenderLeafProps, SelectionStyle } from './editable'
import { Key } from '../utils/key'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  NODE_TO_KEY,
  EDITOR_TO_USER_SELECTION,
  IS_SHIFT_PRESSED,
  IS_COMPOSING,
  SET_IS_FOCUSED,
  DRAW_SELECTION_TO_EDITOR,
} from '../utils/weak-maps'
import {
  isDOMText,
  getPlainText,
  getSlateFragmentAttribute,
} from '../utils/dom'
import { findCurrentLineRange } from '../utils/lines'
import Hotkeys from '../utils/hotkeys'
import { getWordOffsetBackward, getWordOffsetForward } from '../utils/string'
import { Grid } from '../interfaces/grid';
import { GridRow } from '../interfaces/row'
import { GridCell } from '../interfaces/cell';

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
  const { apply, onChange, deleteBackward, deleteForward } = e

  // The WeakMap which maps a key to a specific HTMLElement must be scoped to the editor instance to
  // avoid collisions between editors in the DOM that share the same value.
  EDITOR_TO_KEY_TO_ELEMENT.set(e, new WeakMap())

  e.canFocusVoid = (element: Element) => { 
    return true
  }

  e.isGrid = (value: any): value is Grid => false,
  
  e.isGridRow = (value: any): value is GridRow => false,

  e.isGridCell = (value: any): value is GridCell => false,

  e.deleteForward = unit => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n => e.isGridCell(n)
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
        match: n => e.isGridCell(n)
      })

      if (cell) {
        const [, cellPath] = cell
        const start = Editor.start(editor, cellPath)

        if (Point.equals(selection.anchor, start)) {
          return
        }
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
        const parentElementRange = Editor.range(
          editor,
          parentBlockPath,
          selection.anchor
        )

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
        // Selection was manually set, don't restore the user selection after the change.
        EDITOR_TO_USER_SELECTION.get(editor)?.unref()
        EDITOR_TO_USER_SELECTION.delete(editor)
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
        const commonPath = Path.common(
          Path.parent(op.path),
          Path.parent(op.newPath)
        )
        matches.push(...getMatches(e, commonPath))
        break
      }
    }

    EDITOR_ACTIVE_MARKS.delete(editor)
    EDITOR_ACTIVE_ELEMENTS.delete(editor)

    if(!Editable.isFocused(e)) {
      const setIsFocused = SET_IS_FOCUSED.get(e)
      if(setIsFocused) setIsFocused(true)
    }

    apply(op)

    for (const [path, key] of matches) {
      const [node] = Editor.node(e, path)
      NODE_TO_KEY.set(node, key)
    }
  }

  e.setFragmentData = (data: Pick<DataTransfer, 'getData' | 'setData'>) => {
    const { selection } = e

    if (!selection) {
      return
    }

    const [start, end] = Range.edges(selection)
    const startVoid = Editor.void(e, { at: start.path })
    const endVoid = Editor.void(e, { at: end.path })

    if (Range.isCollapsed(selection) && !startVoid) {
      return
    }

    // Create a fake selection so that we can add a Base64-encoded copy of the
    // fragment to the HTML, to decode on future pastes.
    const domRange = Editable.toDOMRange(e, selection)
    let contents = domRange.cloneContents()
    let attach = contents.childNodes[0] as HTMLElement

    // Make sure attach is non-empty, since empty nodes will not get copied.
    contents.childNodes.forEach(node => {
      if (node.textContent && node.textContent.trim() !== '') {
        attach = node as HTMLElement
      }
    })

    // COMPAT: If the end node is a void node, we need to move the end of the
    // range from the void node's spacer span, to the end of the void node's
    // content, since the spacer is before void's content in the DOM.
    if (endVoid) {
      const [voidNode] = endVoid
      const r = domRange.cloneRange()
      const domNode = Editable.toDOMNode(e, voidNode)
      r.setEndAfter(domNode)
      contents = r.cloneContents()
    }

    // COMPAT: If the start node is a void node, we need to attach the encoded
    // fragment to the void node's content node instead of the spacer, because
    // attaching it to empty `<div>/<span>` nodes will end up having it erased by
    // most browsers. (2018/04/27)
    if (startVoid) {
      attach = contents.querySelector('[data-slate-spacer]')! as HTMLElement
    }

    // Remove any zero-width space spans from the cloned DOM so that they don't
    // show up elsewhere when pasted.
    Array.from(contents.querySelectorAll('[data-slate-zero-width]')).forEach(
      zw => {
        const isNewline = zw.getAttribute('data-slate-zero-width') === 'n'
        zw.textContent = isNewline ? '\n' : ''
      }
    )

    // Set a `data-slate-fragment` attribute on a non-empty node, so it shows up
    // in the HTML, and can be used for intra-Slate pasting. If it's a text
    // node, wrap it in a `<span>` so we have something to set an attribute on.
    if (isDOMText(attach)) {
      const span = attach.ownerDocument.createElement('span')
      // COMPAT: In Chrome and Safari, if we don't add the `white-space` style
      // then leading and trailing spaces will be ignored. (2017/09/21)
      span.style.whiteSpace = 'pre'
      span.appendChild(attach)
      contents.appendChild(span)
      attach = span
    }

    const fragment = e.getFragment()
    const string = JSON.stringify(fragment)
    const encoded = window.btoa(encodeURIComponent(string))
    attach.setAttribute('data-slate-fragment', encoded)
    data.setData('application/x-slate-fragment', encoded)

    // Add the content to a <div> so that we can get its inner HTML.
    const div = contents.ownerDocument.createElement('div')
    div.appendChild(contents)
    div.setAttribute('hidden', 'true')
    contents.ownerDocument.body.appendChild(div)
    data.setData('text/html', div.innerHTML)
    data.setData('text/plain', getPlainText(div))
    contents.ownerDocument.body.removeChild(div)
    return data
  }

  e.insertData = (data: DataTransfer) => {
    if (!e.insertFragmentData(data)) {
      e.insertTextData(data)
    }
  }

  e.insertFragmentData = (data: DataTransfer): boolean => {
    /**
     * Checking copied fragment from application/x-slate-fragment or data-slate-fragment
     */
    const fragment =
      data.getData('application/x-slate-fragment') ||
      getSlateFragmentAttribute(data)

    if (fragment) {
      const decoded = decodeURIComponent(window.atob(fragment))
      const parsed = JSON.parse(decoded) as Node[]
      e.insertFragment(parsed)
      return true
    }
    return false
  }

  e.insertTextData = (data: DataTransfer): boolean => {
    const text = data.getData('text/plain')

    if (text) {
      const lines = text.split(/\r\n|\r|\n/)
      let split = false

      for (const line of lines) {
        if (split) {
          Transforms.splitNodes(e, { always: true })
        }

        e.insertText(line)
        split = true
      }
      return true
    }
    return false
  }

  e.onChange = () => {
    let prevSelection: Range | undefined
    EDITOR_ACTIVE_MARKS.delete(editor)
    EDITOR_ACTIVE_ELEMENTS.delete(editor)
    // COMPAT: React doesn't batch `setState` hook calls, which means that the
    // children and selection can get out of sync for one render pass. So we
    // have to use this unstable API to ensure it batches them. (2019/12/03)
    // https://github.com/facebook/react/issues/14259#issuecomment-439702367
    ReactDOM.unstable_batchedUpdates(() => {
      if (!prevSelection || !e.selection || Range.equals(prevSelection, e.selection)) {
        e.onSelectionChange()
      }

      onChange()
    })
  }

  e.queryActiveMarks = <T extends Text>() => {
    const marks = EDITOR_ACTIVE_MARKS.get(editor)
    if(marks) return marks as Omit<T, 'text' | 'composition'>
    const editorMarks: Omit<T, 'text' | 'composition'> = Editor.marks(e) as any
    if(editorMarks) EDITOR_ACTIVE_MARKS.set(editor, editorMarks)
    return editorMarks ?? {}
  },

  e.queryActiveElements = () => {
    let elements = EDITOR_ACTIVE_ELEMENTS.get(editor)
    if(elements) return elements
    elements = {}
    e.normalizeSelection(selection => {
      if(!elements || selection === null) return
      const nodeEntries = Editor.nodes<Element>(editor, {
        at: selection,
        match: n => !Editor.isEditor(n) && Element.isElement(n)
      })
    
      for(const entry of nodeEntries) {
        const type = entry[0].type ?? 'paragraph'
        if(elements[type]) elements[type].push(entry)
        else elements[type] = [entry]
      }
    })
    
    if(Object.keys(elements).length > 0) EDITOR_ACTIVE_ELEMENTS.set(editor, elements)
    return elements
  },

  e.onKeydown = (event: KeyboardEvent) => {
    if(event.defaultPrevented) return
    const { selection } = editor
    const element =
      editor.children[
        selection !== null ? selection.focus.path[0] : 0
      ]
    const isRTL = getDirection(Node.string(element)) === 'rtl'

    // COMPAT: Since we prevent the default behavior on
    // `beforeinput` events, the browser doesn't think there's ever
    // any history stack to undo or redo, so we have to manage these
    // hotkeys ourselves. (2019/11/06)
    if (Hotkeys.isRedo(event)) {
      event.preventDefault()
      const maybeHistoryEditor: any = editor

      if (typeof maybeHistoryEditor.redo === 'function') {
        maybeHistoryEditor.redo()
      }

      return
    }

    if (Hotkeys.isUndo(event)) {
      event.preventDefault()
      const maybeHistoryEditor: any = editor

      if (typeof maybeHistoryEditor.undo === 'function') {
        maybeHistoryEditor.undo()
      }

      return
    }

    if(Hotkeys.isShift(event)) {
      IS_SHIFT_PRESSED.set(e, true)
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
      if(point && selection) Transforms.select(editor, {
        anchor: selection.anchor,
        focus: point
      })
      return
    }

    if (Hotkeys.isExtendDown(event)) {
      event.preventDefault()
      const point = Editable.findNextLinePoint(e)
      if(point && selection) Transforms.select(editor, {
        anchor: selection.anchor,
        focus: point
      })
      return
    }

    if (Hotkeys.isMoveUp(event)) {
      event.preventDefault()
      const point = Editable.findPreviousLinePoint(e)
      if(point) Transforms.select(editor, point)
      return
    }

    if (Hotkeys.isMoveDown(event)) {
      event.preventDefault()
      const point = Editable.findNextLinePoint(e)
      if(point) Transforms.select(editor, point)
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
      if(selection) {
        const { focus } = selection
        const { path: focusPath } = focus
        if(Editor.isStart(editor, focus, focusPath)) {
          Transforms.move(e, { reverse: !isRTL })
          return
        }
        const { text, offset } = Editable.findTextOffsetOnLine(e, focus)
        if(text) {
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
      if(selection) {
        const { focus } = selection
        const { path: focusPath } = focus
        if(Editor.isEnd(editor, focus, focusPath)) {
          Transforms.move(e, { reverse: isRTL })
          return
        }
        const { text, offset } = Editable.findTextOffsetOnLine(e, focus)
        if(text) {
          const wordOffset = getWordOffsetForward(text, offset)
          Transforms.select(editor, Editable.findPointOnLine(e, focusPath, wordOffset))
          return
        }
      }
      Transforms.move(e, { unit: 'word', reverse: isRTL })
      return
    }

    // COMPAT: If a void node is selected, or a zero-width text node
    // adjacent to an inline is selected, we need to handle these
    // hotkeys manually because browsers won't be able to skip over
    // the void node with the zero-width space not being an empty
    // string.
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
    if(event.key.toLowerCase() === 'shift') {
      IS_SHIFT_PRESSED.set(editor, false)
    }
  }

  e.onFocus = () => {
    Editable.focus(e)
  }

  e.onBlur = () => {}

  e.onInput = (value: string) => {
    const { selection, marks } = editor
      if(!selection) return
      if(IS_COMPOSING.get(e)) {
        let [node, path] = Editor.node(editor, selection)
        if(marks) {
          // 使用零宽字符绕过slate里面不能插入空字符的问题。组合输入法完成后会删除掉
          node = { text: '\u200b', ...marks, composition: {
            text: value,
            offset: 0,
            emptyText: true
          }}
          Transforms.insertNodes(editor, node)
          e.marks = null
        }
        else if(Text.isText(node)) {
          if(Range.isExpanded(selection)) { 
            Editor.deleteFragment(editor)
          }
          const offset = node.composition?.offset ?? selection.anchor.offset
          Transforms.setNodes<Text>(editor, {
            composition: {
              ...node.composition,
              text: value,
              offset
            }
          }, { at: path })
          const point = { path, offset: offset + value.length}
          Transforms.select(editor, {
            anchor: point,
            focus: point
          })
        }
      } else {
        editor.insertText(value)
      }
  }

  e.onBeforeInput = (value: string) => {}

  e.onCompositionStart = (value: string) => {
    IS_COMPOSING.set(editor, true)
  }

  e.onCompositionEnd = (value: string) => { 
    IS_COMPOSING.set(editor, false)
    const { selection } = editor
    if(!selection) return
    const [node, path] = Editor.node(editor, selection)
    if(Text.isText(node)) {
      const { composition } = node
      Transforms.setNodes<Text>(editor, {
        composition: undefined,
      }, { at: path })
      const point = { path, offset: composition?.offset ?? selection.anchor.offset}
      const range = composition?.emptyText ? {
        anchor: { path, offset: 0},
        focus: { path, offset: 1}
      } : point
      Transforms.select(editor, range)
      Transforms.insertText(editor, value)
    }
  }

  e.onSelectStart = () => {}
  e.onSelecting = () => {}
  e.onSelectEnd = () => {}
  e.onSelectionChange = () => {}

  e.setSelectionStyle = (style: SelectionStyle) => {}

  e.renderElementAttributes = ({ attributes }) => { 
    return attributes
  }

  e.renderLeafAttributes = ({ attributes }) => { 
    return attributes
  }

  e.renderElement = (props: RenderElementProps) => {
    const { attributes, children, element } = props
    const Tag = e.isInline(element) ? 'span' : 'div'
    return (
      <Tag {...attributes}>
        {children}
      </Tag>
    )
  }

  e.renderLeaf = (props: RenderLeafProps) => {
    const { attributes, children } = props
    return <span {...attributes}>{children}</span>
  }

  e.renderPlaceholder = ({ attributes, children }) => {
    if(!Editable.isEmpty(e, editor)) return
    return <span style={{pointerEvents: 'none', userSelect: 'none', position: 'relative'}}><span style={{
      position: 'absolute',
      opacity: '0.333',
      width: 'fit-content',
      whiteSpace: 'nowrap'
    }} {...attributes}>{children}</span></span>
  }

  e.clearSelectionDraw = () => {
    const setSelectionDraw = DRAW_SELECTION_TO_EDITOR.get(e)
    if(setSelectionDraw) { 
      setSelectionDraw(false)
    }
  }

  e.startSelectionDraw = () => { 
    const setSelectionDraw = DRAW_SELECTION_TO_EDITOR.get(e)
    if(setSelectionDraw) { 
      setSelectionDraw(true)
    }
  }

  e.normalizeSelection = (fn) => {
    const { selection } = e
    const grid = Grid.findGrid(e)
    if(grid && selection) {
      const sel = Grid.getSelection(e, grid)
      if(sel){
        let { start, end } = sel
        const [startRow, startCol] = start
        const [endRow, endCol] = end
    
        const rowCount = endRow - startRow
        const colCount = endCol - startCol

        if(rowCount > 0 || colCount > 0) {
          const [, path] = grid
          const edgesSelection = Grid.edges(e, grid, sel)
          const { start: edgeStart, end: edgeEnd } = edgesSelection
          const cells = Grid.cells(e, grid, {
            startRow: edgeStart[0],
            startCol: edgeStart[1],
            endRow: edgeEnd[0],
            endCol: edgeEnd[1]
          })
          
          for(const [cell, row, col] of cells) {
            if(!cell) break
            if(!cell.span) {
              const anchor = Editable.toLowestPoint(e, path.concat([row, col]))
              const focus = Editable.toLowestPoint(e, path.concat([row, col]), 'end')
              const range = {anchor, focus}
              fn(range)
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
