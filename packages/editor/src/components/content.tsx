import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Editor, Node, Range, Transforms, Point, Selection, Descendant } from 'slate'
import scrollIntoView from 'scroll-into-view-if-needed'

import useChildren from '../hooks/use-children'
import { Editable, useEditableStatic } from '..'
import { ReadOnlyContext } from '../hooks/use-read-only'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { DOMRange, getDefaultView } from '../utils/dom'
import {
  EDITOR_TO_ELEMENT,
  ELEMENT_TO_NODE,
  IS_READ_ONLY,
  NODE_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  IS_SHIFT_PRESSED,
  EDITOR_TO_PLACEHOLDER,
  EDITOR_TO_INPUT,
  EDITOR_TO_SHADOW,
  IS_DRAW_SELECTION,
  IS_MOUSEDOWN,
  EDITOR_TO_SELECTION_RECTS,
} from '../utils/weak-maps'
import { getWordRange } from '../utils/text'
import { useMultipleClick } from '../hooks/use-multiple-click'
import { SelectionStyle } from '../plugin/editable'
import { useFocused } from '../hooks/use-focused'
import Shadow, { ShadowRect } from './shadow'
import { CaretComponent } from './caret'
import { SelectionComponent } from './selection'
import { InputComponent } from './input'
import { DrawSelectionContext } from '../hooks/use-draw-selection'
import cloneDeep from 'lodash/cloneDeep'

const Children = (props: Parameters<typeof useChildren>[0]) => (
  <React.Fragment>{useChildren(props)}</React.Fragment>
)

const SELECTION_DEFAULT_BLUR_COLOR = 'rgba(136, 136, 136, 0.3)'
const SELECTION_DEFAULT_FOCUS_COLOR = 'rgba(0,127,255,0.3)'
const SELECTION_DEFAULT_CARET_COLOR = '#000'
const SELECTION_DEFAULT_CARET_WIDTH = 1
const SELECTION_DEFAULT_DRAG_COLOR = 'rgb(37, 99, 235)'

/**
 * `EditableProps` are passed to the `<Editable>` component.
 */
export type EditableProps = {
  autoFocus?: boolean
  placeholder?: string
  readOnly?: boolean
  role?: string
  style?: React.CSSProperties
  scrollSelectionIntoView?: (editor: Editable, domRange: DOMRange) => void
  as?: React.ElementType
  selectionStyle?: SelectionStyle
}

const mergeSelectionStyle = (
  selectionStyle: SelectionStyle,
  oldStyle: SelectionStyle = {
    focusColor: SELECTION_DEFAULT_FOCUS_COLOR,
    blurColor: SELECTION_DEFAULT_BLUR_COLOR,
    caretColor: SELECTION_DEFAULT_CARET_COLOR,
    caretWidth: SELECTION_DEFAULT_CARET_WIDTH,
    dragColor: SELECTION_DEFAULT_DRAG_COLOR,
  },
): Required<SelectionStyle> => {
  return Object.assign({}, oldStyle, selectionStyle) as Required<SelectionStyle>
}

interface Drag {
  from: Range
  data: Descendant[]
}

/**
 * ContentEditable.
 */
export const ContentEditable = (props: EditableProps) => {
  const {
    autoFocus,
    placeholder,
    readOnly = false,
    scrollSelectionIntoView = defaultScrollSelectionIntoView,
    style = {},
    as: Component = 'div',
    selectionStyle,
    ...attributes
  } = props
  const editor = useEditableStatic()
  const [rendered, setRendered] = useState(false)

  const [drawSelection, setDrawSelection] = useState<Selection>(null)
  const [drawSelectionStyle, setDrawSelectionStyle] = useState(
    mergeSelectionStyle(selectionStyle ?? {}),
  )
  const [drawRects, setDrawRects] = useState<DOMRect[]>([])
  const [isDrawSelection, setIsDrawSelection] = useState(true)

  const ref = useRef<HTMLDivElement>(null)
  const dragRef = useRef<Drag | null>(null)
  const [dragTo, setDragTo] = useState<Range | null>(null)
  const isDragEnded = useRef(false)

  // Update internal state on each render.
  IS_READ_ONLY.set(editor, readOnly)
  EDITOR_TO_PLACEHOLDER.set(editor, placeholder ?? '')
  IS_DRAW_SELECTION.set(editor, setIsDrawSelection)

  useEffect(() => {
    if (autoFocus) {
      Editable.focus(editor)
    }
  }, [editor, autoFocus])

  useEffect(() => {
    editor.setSelectionStyle = style => {
      setDrawSelectionStyle(value => mergeSelectionStyle(style, value))
    }
  }, [editor])

  const [focused, setFocused] = useFocused()

  const startPointRef = useRef<Point | null>(null)
  const isContextMenu = useRef(false)

  const handleDocumentMouseDown = (event: MouseEvent) => {
    const isMouseDown = IS_MOUSEDOWN.get(editor)
    if (!isMouseDown && !event.defaultPrevented) setFocused(false)
  }

  const handleSelecting = (point: Point | null, rest = true) => {
    if (!point) return
    const { selection } = editor
    if (!rest && selection && Range.includes(selection, point)) {
      return
    }
    const anchor =
      IS_SHIFT_PRESSED.get(editor) && selection ? selection.anchor : startPointRef.current
    if (!anchor) return
    const range: Range = { anchor, focus: point }
    if (selection && Range.equals(range, selection)) {
      Editable.focus(editor)
      setFocused(true)
      return
    }
    Transforms.select(editor, range)
    return range
  }

  const handleDocumentMouseUp = (event: MouseEvent) => {
    const isMouseDown = IS_MOUSEDOWN.get(editor)
    if (isMouseDown && (!event.defaultPrevented || event.button === 2)) {
      if (focused && EDITOR_TO_SHADOW.get(editor)?.activeElement !== EDITOR_TO_INPUT.get(editor)) {
        Editable.focus(editor)
      }
      const point = Editable.findEventPoint(editor, event)
      if (point && dragRef.current) {
        const { from, data } = dragRef.current
        if (!Range.includes(from, point)) {
          Transforms.delete(editor, {
            at: from,
            unit: 'line',
            hanging: true,
          })
          Transforms.select(editor, point)
          Transforms.insertFragment(editor, data)
          const { selection } = editor
          if (selection) {
            Transforms.select(editor, {
              anchor: point,
              focus: selection.focus,
            })
          }
          isDragEnded.current = true
        } else {
          Transforms.select(editor, point)
        }
      } else {
        handleSelecting(point, !isContextMenu.current)
      }
      dragRef.current = null
      setDragTo(null)
      if (!isDragEnded.current) editor.onSelectEnd()
    }
    isContextMenu.current = false
    IS_MOUSEDOWN.set(editor, false)
  }

  const handleDocumentMouseMove = (event: MouseEvent) => {
    const isMouseDown = IS_MOUSEDOWN.get(editor)
    if (event.button !== 0 || !isMouseDown || event.defaultPrevented || isContextMenu.current)
      return
    const point = Editable.findEventPoint(editor, event)

    if (point && dragRef.current) {
      setDragTo({
        anchor: point,
        focus: point,
      })
      return
    }
    const range = handleSelecting(point)
    if (range) editor.onSelecting()
  }

  const handleRootMouseDown = (event: React.MouseEvent) => {
    if (event.defaultPrevented && event.button !== 2) return
    IS_MOUSEDOWN.set(editor, true)
    if (isDoubleClickRef.current) {
      if (isSamePoint(event)) {
        return
      } else {
        isDoubleClickRef.current = false
      }
    }
    setFocused(true)
    const point = Editable.findEventPoint(editor, event)
    if (point) {
      const isShift = IS_SHIFT_PRESSED.get(editor)
      if (!isShift) {
        const { selection } = editor
        if (event.button === 2) {
          isContextMenu.current = true
        } else if (
          selection &&
          Range.isExpanded(selection) &&
          Range.includes(selection, point) &&
          !Point.equals(Range.end(selection), point) &&
          !Point.equals(Range.start(selection), point)
        ) {
          dragRef.current = {
            from: selection,
            data: cloneDeep(editor.getFragment(selection)),
          }
          editor.onSelectStart()
          return
        }
        startPointRef.current = point
      }
      const range = handleSelecting(point, !isContextMenu.current)
      if (range) editor.onSelectStart()
    } else startPointRef.current = null
  }

  const isDoubleClickRef = useRef(false)

  const { handleMultipleClick, isSamePoint } = useMultipleClick({
    onClick: () => {
      isDoubleClickRef.current = false
    },
    onMultipleClick: (event, count) => {
      event.preventDefault()
      const { selection } = editor
      if (!selection) return
      const { focus } = selection
      const { path: focusPath } = focus
      const focusNode = Node.get(editor, focusPath)
      const isCollapsed = Range.isCollapsed(selection)
      if (count === 1 && !isCollapsed) {
        return false
      } else if (count === 2) {
        const { text, offset } = Editable.findTextOffsetOnLine(editor, focus)
        if (text) {
          const [startOffset, endOffset] = getWordRange(text, offset)
          Transforms.select(editor, {
            anchor: Editable.findPointOnLine(editor, focusPath, startOffset, true),
            focus: Editable.findPointOnLine(editor, focusPath, endOffset),
          })
          isDoubleClickRef.current = true
          setTimeout(() => {
            isDoubleClickRef.current = false
          }, 500)
          Editable.focus(editor)
          return
        }
      } else if (count === 3) {
        let blockPath = focusPath
        if (!Editor.isBlock(editor, focusNode)) {
          const block = Editor.above(editor, {
            match: n => Editor.isBlock(editor, n),
            at: focusPath,
          })

          blockPath = block?.[1] ?? focusPath.slice(0, 1)
        }

        const range = Editor.range(editor, blockPath)
        Transforms.select(editor, range)
        isDoubleClickRef.current = false
        Editable.focus(editor)
        return false
      }
    },
  })

  // Whenever the editor updates...
  useIsomorphicLayoutEffect(() => {
    const { onChange } = editor
    editor.onChange = () => {
      const { selection } = editor
      onChange()
      setDrawSelection(selection ? { ...selection } : null)
      if (isDragEnded.current) {
        editor.onSelectEnd()
        isDragEnded.current = false
      }
    }

    const handleShift = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'shift') {
        IS_SHIFT_PRESSED.set(editor, false)
      }
    }

    let window: Window | null = null
    if (ref.current && (window = getDefaultView(ref.current))) {
      EDITOR_TO_WINDOW.set(editor, window)
      EDITOR_TO_ELEMENT.set(editor, ref.current)
      NODE_TO_ELEMENT.set(editor, ref.current)
      ELEMENT_TO_NODE.set(ref.current, editor)
      setRendered(true)

      window.addEventListener('keyup', handleShift)
      window.addEventListener('mousedown', handleDocumentMouseDown)
      window.addEventListener('mouseup', handleDocumentMouseUp)
      window.addEventListener('mousemove', handleDocumentMouseMove)
    } else {
      NODE_TO_ELEMENT.delete(editor)
    }

    return () => {
      editor.onChange = onChange
      window?.removeEventListener('keyup', handleShift)
      window?.removeEventListener('mousedown', handleDocumentMouseDown)
      window?.removeEventListener('mouseup', handleDocumentMouseUp)
      window?.removeEventListener('mousemove', handleDocumentMouseMove)
    }
  }, [editor])

  useIsomorphicLayoutEffect(() => {
    const rects = drawSelection ? Editable.getSelectionRects(editor, drawSelection) : []
    EDITOR_TO_SELECTION_RECTS.set(editor, rects)
    setDrawRects(rects)
  }, [drawSelection])

  const contextElements = useMemo(() => editor.onRenderContextComponents([]), [editor])

  const dragCaretRects = useMemo(
    () => (dragTo ? Editable.getSelectionRects(editor, dragTo) : null),
    [dragTo, editor],
  )

  return (
    <ReadOnlyContext.Provider value={readOnly}>
      <div
        data-slate-content="true"
        style={{
          ...style,
          position: 'relative',
        }}
      >
        <Component
          role={readOnly ? undefined : 'textbox'}
          {...attributes}
          data-slate-editor
          data-slate-node="value"
          zindex={-1}
          ref={ref}
          style={{
            // Prevent the default outline styles.
            outline: 'none',
            // Preserve adjacent whitespace and new lines.
            whiteSpace: 'pre-wrap',
            // Allow words to break if they are too long.
            wordBreak: 'break-word',
            // Disable the default user-select behavior.
            userSelect: 'none',
            // Set cursor to text.
            cursor: 'text',
            //
            overflowWrap: 'break-word',
          }}
          onMouseDown={handleRootMouseDown}
          onClick={handleMultipleClick}
        >
          <Children node={editor} selection={editor.selection} />
        </Component>
        <DrawSelectionContext.Provider
          value={{
            selection: drawSelection,
            rects: drawRects,
          }}
        >
          <Shadow ref={current => EDITOR_TO_SHADOW.set(editor, current)}>
            {isDrawSelection && (
              <CaretComponent
                width={drawSelectionStyle.caretWidth}
                color={drawSelectionStyle.caretColor}
              />
            )}
            {isDrawSelection && (
              <SelectionComponent
                color={focused ? drawSelectionStyle.focusColor : drawSelectionStyle.blurColor}
              />
            )}
            {dragCaretRects && dragCaretRects.length > 0 && (
              <ShadowRect
                rect={Object.assign({}, dragCaretRects[0].toJSON(), {
                  width: drawSelectionStyle.caretWidth,
                  color: drawSelectionStyle.dragColor,
                })}
                style={{ willChange: 'transform' }}
              />
            )}
            <InputComponent />
          </Shadow>
        </DrawSelectionContext.Provider>
        {rendered && contextElements.map((Component, index) => <Component key={index} />)}
      </div>
    </ReadOnlyContext.Provider>
  )
}

/**
 * A default implement to scroll dom range into view.
 */
const defaultScrollSelectionIntoView = (editor: Editable, domRange: DOMRange) => {
  // This was affecting the selection of multiple blocks and dragging behavior,
  // so enabled only if the selection has been collapsed.
  if (!editor.selection || (editor.selection && Range.isCollapsed(editor.selection))) {
    const leafEl = domRange.startContainer.parentElement!
    leafEl.getBoundingClientRect = domRange.getBoundingClientRect.bind(domRange)
    scrollIntoView(leafEl, {
      scrollMode: 'if-needed',
    })
    delete (leafEl as any).getBoundingClientRect
  }
}
