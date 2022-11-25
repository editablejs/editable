import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Editor, Node, Range, Transforms, Point } from 'slate'
import scrollIntoView from 'scroll-into-view-if-needed'

import useChildren from '../hooks/use-children'
import { Editable, useEditableStatic } from '..'
import { useReadOnly } from '../hooks/use-read-only'
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
  IS_MOUSEDOWN,
} from '../utils/weak-maps'
import { getWordRange } from '../utils/text'
import { useMultipleClick } from '../hooks/use-multiple-click'
import { useFocused } from '../hooks/use-focused'
import Shadow from './shadow'
import { CaretComponent } from './caret'
import { SelectionComponent } from './selection'
import { InputComponent } from './input'
import { Drag, useDragging, useDragTo } from '../hooks/use-drag'
import { SelectionDrawing, SelectionDrawingStyle } from '../hooks/use-selection-drawing'
import { APPLICATION_FRAGMENT_TYPE } from '../utils/constants'
import { DragCaretComponent } from './drag-caret'
import { fragmentToString, parseFragmentFromString } from '../utils/data-transfer'
import { Slots } from './slots'

const Children = (props: Parameters<typeof useChildren>[0]) => (
  <React.Fragment>{useChildren(props)}</React.Fragment>
)

/**
 * `EditableProps` are passed to the `<Editable>` component.
 */
export type EditableProps = {
  autoFocus?: boolean
  placeholder?: string
  role?: string
  style?: React.CSSProperties
  scrollSelectionIntoView?: (editor: Editable, domRange: DOMRange) => void
  as?: React.ElementType
  selectionDrawingStyle?: SelectionDrawingStyle
}

/**
 * ContentEditable.
 */
export const ContentEditable = (props: EditableProps) => {
  const {
    autoFocus,
    placeholder,
    scrollSelectionIntoView = defaultScrollSelectionIntoView,
    style = {},
    as: Component = 'div',
    selectionDrawingStyle: selectionDrawingStyleProp,
    ...attributes
  } = props
  const editor = useEditableStatic()

  const ref = useRef<HTMLDivElement>(null)
  const readOnly = useReadOnly()
  // 标记是否是刚拖拽完毕
  const isDragEnded = useRef(false)
  const dragTo = useDragTo()
  const dragging = useDragging()
  // Update internal state on each render.
  EDITOR_TO_PLACEHOLDER.set(editor, placeholder ?? '')

  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (autoFocus) {
      editor.focus()
    }
  }, [editor, autoFocus])

  useIsomorphicLayoutEffect(() => {
    IS_READ_ONLY.set(editor, readOnly)
  }, [editor, readOnly])

  useIsomorphicLayoutEffect(() => {
    if (selectionDrawingStyleProp) SelectionDrawing.setStyle(editor, selectionDrawingStyleProp)
  }, [editor, selectionDrawingStyleProp])

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
      editor.focus()
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
        editor.focus()
      }
      const point = Editable.findEventPoint(editor, event)
      if (point && Drag.isDragging()) {
        const { from, data } = Drag.getDrag()
        if (!Range.includes(from, point)) {
          Transforms.delete(editor, {
            at: from,
            unit: 'line',
            hanging: true,
          })
          Transforms.select(editor, point)
          const fragment = parseFragmentFromString(data.getData(APPLICATION_FRAGMENT_TYPE))
          Transforms.insertFragment(editor, fragment)
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
      Drag.clear()
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

    if (point && Drag.isDragging()) {
      Drag.setTo({
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
          focused &&
          Range.isExpanded(selection) &&
          Range.includes(selection, point) &&
          !Point.equals(Range.end(selection), point) &&
          !Point.equals(Range.start(selection), point)
        ) {
          const dataTransfer = new DataTransfer()
          dataTransfer.setData(
            APPLICATION_FRAGMENT_TYPE,
            fragmentToString(editor.getFragment(selection)),
          )
          Drag.setFrom(selection, dataTransfer, {
            x: event.clientX,
            y: event.clientY,
          })
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
        return false
      }
    },
  })

  const [awaitUpdateDrawingSelection, setAwaitUpdateDrawingSelection] = useState(editor.selection)

  useIsomorphicLayoutEffect(() => {
    const { onChange } = editor
    editor.onChange = () => {
      const { selection } = editor
      onChange()
      setAwaitUpdateDrawingSelection(selection ? Object.assign({}, selection) : null)
      // 在拖拽完成后触发onSelectEnd，否则内容可能还未渲染完毕
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
  })

  useIsomorphicLayoutEffect(() => {
    SelectionDrawing.setSelection(editor, awaitUpdateDrawingSelection)
  }, [awaitUpdateDrawingSelection])

  // 处理文件拖拽
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    const point = Editable.findEventPoint(editor, event)
    if (point) {
      const dragRange = {
        anchor: point,
        focus: point,
      }
      const position = {
        x: event.clientX,
        y: event.clientY,
      }
      if (!dragging) {
        Drag.setFrom(dragRange, event.dataTransfer, position)
      }
      Drag.setPoint(position)
      Drag.setTo(dragRange)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    Drag.clear()
    const point = Editable.findEventPoint(editor, event)
    if (point) {
      Transforms.select(editor, point)
      const clipboardEvent = new ClipboardEvent('paset', { clipboardData: event.dataTransfer })
      editor.onPaste(clipboardEvent)
    }
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    editor.onContextMenu(event.nativeEvent)
  }

  const cursor = useMemo(() => {
    if (dragging && dragTo) {
      return 'default'
    }
    return 'text'
  }, [dragTo, dragging])

  return (
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
          cursor,
          //
          overflowWrap: 'break-word',
        }}
        onMouseDown={handleRootMouseDown}
        onClick={handleMultipleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onContextMenu={handleContextMenu}
      >
        <Children node={editor} selection={editor.selection} />
      </Component>
      <Shadow ref={current => EDITOR_TO_SHADOW.set(editor, current)}>
        <CaretComponent />
        <DragCaretComponent />
        <SelectionComponent />
        <InputComponent />
      </Shadow>
      {rendered && <Slots />}
    </div>
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
