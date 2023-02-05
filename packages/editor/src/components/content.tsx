import * as React from 'react'
import {
  Editor,
  Node,
  Range,
  Transforms,
  Point,
  Path,
  Element,
  DOMNode,
  DOMRange,
  getDefaultView,
  isDOMNode,
} from '@editablejs/models'
import scrollIntoView from 'scroll-into-view-if-needed'

import useChildren from '../hooks/use-children'
import { useEditable, useEditableStatic } from '../hooks/use-editable'
import { Editable } from '../plugin/editable'
import { useReadOnly } from '../hooks/use-read-only'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { inAbsoluteDOMElement } from '../utils/dom'
import {
  EDITOR_TO_ELEMENT,
  ELEMENT_TO_NODE,
  IS_READ_ONLY,
  NODE_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  IS_SHIFT_PRESSED,
  EDITOR_TO_SHADOW,
  IS_MOUSEDOWN,
  IS_TOUCHMOVING,
  IS_TOUCHING,
  IS_TOUCH_HOLD,
} from '../utils/weak-maps'
import { getWordRange } from '../utils/text'
import { useMultipleClick } from '../hooks/use-multiple-click'
import { useFocused } from '../hooks/use-focused'
import Shadow from './shadow'
import { CaretComponent } from './caret'
import { SelectionComponent } from './selection'
import { InputComponent } from './input'
import { useDragging, useDragMethods, useDragTo } from '../hooks/use-drag'
import { SelectionDrawing, SelectionDrawingStyle } from '../plugin/selection-drawing'
import { APPLICATION_FRAGMENT_TYPE, DATA_EDITABLE_NODE } from '../utils/constants'
import { DragCaretComponent } from './drag-caret'
import { parseFragmentFromString, setDataTransfer } from '../utils/data-transfer'
import { Slots } from './slot'
import { Drag } from '../plugin/drag'
import { Placeholder } from '../plugin/placeholder'
import { usePlaceholder } from '../hooks/use-placeholder'
import { isTouchDevice } from '../utils/environment'
import { TouchPointComponent } from './touch-point'
import { getNativeEvent, isMouseEvent, isTouchEvent } from '../utils/event'
import { canForceTakeFocus, isEditableDOMElement } from '../utils/dom'

const Children = (props: Omit<Parameters<typeof useChildren>[0], 'node' | 'selection'>) => {
  const editor = useEditable()
  return (
    <React.Fragment>
      {useChildren({ ...props, node: editor, selection: editor.selection })}
    </React.Fragment>
  )
}

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

  const ref = React.useRef<HTMLDivElement>(null)
  const readOnly = useReadOnly()
  // 标记是否是刚拖拽完毕
  const isDragEnded = React.useRef(false)
  const dragTo = useDragTo()
  const dragging = useDragging()
  const { getDrag, setDrag } = useDragMethods()

  const [rendered, setRendered] = React.useState(false)

  // Touch hold timer
  const touchHoldTimer = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (autoFocus) {
      editor.focus()
    }
  }, [editor, autoFocus])

  React.useEffect(() => {
    if (placeholder) {
      Placeholder.add(editor, {
        key: 'editorRootPlaceholder',
        check: entry => {
          return Editable.isEditor(entry[0])
        },
        render: () => placeholder,
      })
      if (Editor.isEmpty(editor, editor)) {
        Placeholder.setCurrent(editor, [editor, []])
      }
    }
    return () => {
      Placeholder.remove(editor, 'editorRootPlaceholder')
    }
  }, [editor, placeholder])

  useIsomorphicLayoutEffect(() => {
    IS_READ_ONLY.set(editor, readOnly)
  }, [editor, readOnly])

  useIsomorphicLayoutEffect(() => {
    if (selectionDrawingStyleProp) SelectionDrawing.setStyle(editor, selectionDrawingStyleProp)
  }, [editor, selectionDrawingStyleProp])

  const [focused, setFocused] = useFocused()

  const startPointRef = React.useRef<Point | null>(null)
  const isContextMenu = React.useRef(false)

  const clearTouchHoldTimer = () => {
    if (touchHoldTimer.current) clearTimeout(touchHoldTimer.current)
  }

  const handleDocumentMouseDown = (event: MouseEvent | TouchEvent) => {
    const isMouseDown = IS_MOUSEDOWN.get(editor)
    if (!isMouseDown && !event.defaultPrevented) setFocused(false)
  }

  const handleSelecting = (point: Point | null, rest = true, forceFocus = true) => {
    if (!point) return
    const { selection } = editor
    if (!rest && selection && Range.includes(selection, point)) {
      return
    }
    let anchor: Point | null = null

    if (IS_TOUCHING.get(editor)) {
      anchor = point
    } else {
      anchor = IS_SHIFT_PRESSED.get(editor) && selection ? selection.anchor : startPointRef.current
    }
    if (!anchor) return
    const range: Range = { anchor, focus: point }
    if (selection && forceFocus && Range.equals(range, selection)) {
      editor.focus()
      setFocused(true)
      return
    }
    Transforms.select(editor, range)
    return range
  }

  const handleDocumentTouchEnd = (event: TouchEvent) => {
    if (event.defaultPrevented) return
    clearTouchHoldTimer()
    // touch move 之后不会触发 mouse up 事件，所以需要在 touch end 时触发
    if (IS_TOUCHMOVING.get(editor)) {
      handleDocumentMouseUp(event)
      IS_TOUCHING.set(editor, false)
    }
  }

  const handleDocumentMouseUp = (event: MouseEvent | TouchEvent) => {
    const drag = getDrag()
    const isMouseDown = IS_MOUSEDOWN.get(editor)
    if (
      drag ||
      (IS_TOUCHING.get(editor) && !IS_TOUCH_HOLD.get(editor)) ||
      (isMouseDown &&
        (!event.defaultPrevented || (event instanceof MouseEvent && event.button === 2)))
    ) {
      if (focused && !isEditableDOMElement(event.target) && canForceTakeFocus()) {
        editor.focus()
      }
      const point = Editable.findEventPoint(editor, event)
      if (point && drag) {
        const { from, data, type = 'text' } = drag
        const fromRange = Editor.range(editor, from)
        if (!Range.includes(fromRange, point)) {
          const fragment = parseFragmentFromString(data.getData(APPLICATION_FRAGMENT_TYPE))
          if (type === 'block') {
            const path = Drag.toBlockPath(editor)
            if (path && fragment.length > 0) {
              const rangeRef = Editor.rangeRef(editor, {
                anchor: {
                  path,
                  offset: 0,
                },
                focus: {
                  path,
                  offset: 0,
                },
              })
              Transforms.removeNodes(editor, { at: from })
              const at = rangeRef.unref()
              Transforms.insertNodes(editor, fragment, {
                at: at?.anchor.path ?? path,
                select: true,
              })
            }
          } else {
            const deleteAfterRange = Editor.rangeRef(editor, Editor.range(editor, point))
            Transforms.delete(editor, {
              at: from,
              unit: 'line',
              hanging: true,
            })
            const anchorRange = deleteAfterRange.unref()
            Transforms.select(editor, anchorRange ?? point)
            Transforms.insertFragment(editor, fragment)
            const focus = editor.selection?.focus
            if (anchorRange && focus) {
              let anchor = anchorRange.anchor
              const anchorElement = Editor.above(editor, {
                at: anchorRange,
                match: node => Element.isElement(node),
                voids: true,
              })

              const nextPath = Path.next(anchor.path)

              if (anchorElement && Editor.hasPath(editor, nextPath)) {
                const nextRange = Editor.range(editor, nextPath)
                const element = Editor.above(editor, {
                  at: nextRange,
                  match: node => Element.isElement(node),
                  voids: true,
                })
                if (element && anchorElement[0] !== element[0]) {
                  anchor = nextRange.anchor
                }
              }
              Transforms.select(editor, {
                anchor,
                focus,
              })
            }
          }

          isDragEnded.current = true
        } else {
          Transforms.select(editor, point)
        }
      } else {
        handleSelecting(point, !isContextMenu.current, !isEditableDOMElement(event.target))
      }
      // 修复 touch 时，触发了 mouse up 事件，导致无法触发 onSelectStart
      if (IS_TOUCHING.get(editor) && !IS_TOUCH_HOLD.get(editor)) {
        editor.onSelectStart()
      }
      setDrag(null)
      if (!isDragEnded.current) editor.onSelectEnd()
    }
    isContextMenu.current = false
    startPointRef.current = null
    IS_TOUCHMOVING.set(editor, false)
    IS_TOUCHING.set(editor, false)
    IS_MOUSEDOWN.set(editor, false)
  }

  const handleDocumentMouseMove = (event: MouseEvent | TouchEvent) => {
    const darg = getDrag()
    const isMouseDown = IS_MOUSEDOWN.get(editor)
    // 未长按不触发 move 事件
    if (IS_TOUCHING.get(editor) && !IS_TOUCH_HOLD.get(editor)) {
      clearTouchHoldTimer()
      return
    }
    IS_TOUCHMOVING.set(editor, isTouchEvent(event))

    if (
      !darg &&
      ((isMouseEvent(event) && event.button !== 0) ||
        !isMouseDown ||
        event.defaultPrevented ||
        isContextMenu.current)
    )
      return
    const point = Editable.findEventPoint(editor, event)
    if (point && dragging && isMouseEvent(event)) {
      setDrag({
        to: {
          anchor: point,
          focus: point,
        },
        position: {
          x: event.clientX,
          y: event.clientY,
        },
      })
      return
    }
    // 阻止 touchmove 时页面滚动
    if (isTouchEvent(event)) event.preventDefault()
    const range = handleSelecting(point)
    if (range) editor.onSelecting()
  }

  const handleRootTouchStart = (event: React.TouchEvent) => {
    if (event.defaultPrevented) return
    if (
      !event.target ||
      !ref.current?.contains(event.target as DOMNode) ||
      isEditableDOMElement(event.target) ||
      inAbsoluteDOMElement(event.target)
    )
      return
    IS_TOUCHING.set(editor, true)
    IS_TOUCH_HOLD.set(editor, false)
    clearTouchHoldTimer()
    // touch 应该延迟选中
    touchHoldTimer.current = setTimeout(() => {
      IS_TOUCH_HOLD.set(editor, true)
      handleRootMouseDown(event)
    }, 300)
  }

  const handleRootMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const event = getNativeEvent(e)
    if (e.defaultPrevented && isMouseEvent(event) && event.button !== 2) return
    if (
      !event.target ||
      !ref.current?.contains(event.target as DOMNode) ||
      isEditableDOMElement(event.target) ||
      inAbsoluteDOMElement(event.target)
    )
      return

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
        if (event instanceof MouseEvent && event.button === 2) {
          isContextMenu.current = true
        } else if (
          selection &&
          focused &&
          Range.includes(selection, point) &&
          ((!Point.equals(Range.end(selection), point) &&
            !Point.equals(Range.start(selection), point)) ||
            (Range.isCollapsed(selection) &&
              !!Editor.above(editor, { match: n => Editor.isVoid(editor, n) })))
        ) {
          const dataTransfer = new DataTransfer()
          setDataTransfer(dataTransfer, {
            fragment: editor.getFragment(selection),
          })
          setDrag({
            from: selection,
            data: dataTransfer,
            position: {
              x: event.clientX,
              y: event.clientY,
            },
          })
          editor.onSelectStart()
          return
        }
        startPointRef.current = point
      }
      const range = handleSelecting(
        point,
        !isContextMenu.current,
        !isEditableDOMElement(event.target),
      )
      if (range) editor.onSelectStart()
    } else startPointRef.current = null
  }

  const handleRootMouseUp = () => {
    startPointRef.current = null
  }

  const isDoubleClickRef = React.useRef(false)
  const isDoubleClickTimerRef = React.useRef<number>()
  const { handleMultipleClick, isSamePoint } = useMultipleClick({
    onClick: () => {
      isDoubleClickRef.current = false
    },
    onMultipleClick: (event, count) => {
      const { selection } = editor
      if (!selection || event.defaultPrevented) return
      event.preventDefault()
      const container = Editable.toDOMNode(editor, editor)
      if (isDOMNode(event.target) && !container.contains(event.target)) return
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
          editor.onSelectEnd()
          isDoubleClickRef.current = true
          if (isDoubleClickTimerRef.current) clearTimeout(isDoubleClickTimerRef.current)
          isDoubleClickTimerRef.current = setTimeout(() => {
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
        editor.onSelectEnd()
        isDoubleClickRef.current = false
        return false
      }
    },
  })

  const [awaitUpdateDrawingSelection, setAwaitUpdateDrawingSelection] = React.useState(
    editor.selection,
  )

  useIsomorphicLayoutEffect(() => {
    const handleChange = () => {
      const { selection } = editor
      setAwaitUpdateDrawingSelection(selection ? Object.assign({}, selection) : null)
    }
    editor.on('change', handleChange)

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
      if (isTouchDevice) {
        window.addEventListener('touchend', handleDocumentTouchEnd)
        window.addEventListener('touchmove', handleDocumentMouseMove, { passive: false })
      } else {
        window.addEventListener('mousemove', handleDocumentMouseMove)
      }
    } else {
      NODE_TO_ELEMENT.delete(editor)
    }

    return () => {
      editor.off('change', handleChange)
      window?.removeEventListener('keyup', handleShift)
      window?.removeEventListener('mousedown', handleDocumentMouseDown)
      window?.removeEventListener('mouseup', handleDocumentMouseUp)
      if (isTouchDevice) {
        window?.removeEventListener('touchend', handleDocumentTouchEnd)
        window?.removeEventListener('touchmove', handleDocumentMouseMove)
      } else {
        window?.removeEventListener('mousemove', handleDocumentMouseMove)
      }
    }
  })

  React.useEffect(() => {
    // 在拖拽完成后触发onSelectEnd，否则内容可能还未渲染完毕
    if (isDragEnded.current) {
      editor.onSelectEnd()
      isDragEnded.current = false
    }
  }, [awaitUpdateDrawingSelection, editor])

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
        setDrag({
          type: 'text',
          from: dragRange,
          data: event.dataTransfer,
        })
      }
      setDrag({
        position,
        to: dragRange,
      })
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDrag(null)
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

  const cursor = React.useMemo(() => {
    if (dragging && dragTo) {
      return 'default'
    }
    return 'text'
  }, [dragTo, dragging])

  const renderPlaceholder = usePlaceholder(editor)

  const handleAnchorTouchPointStart = React.useCallback(
    (event: React.TouchEvent) => {
      const { selection } = editor
      if (!selection) return
      startPointRef.current = Range.isBackward(selection) ? selection.anchor : selection.focus
      IS_MOUSEDOWN.set(editor, true)
      editor.onSelectStart()
    },
    [editor],
  )

  const handleFocusTouchPointStart = React.useCallback(
    (event: React.TouchEvent) => {
      event.stopPropagation()
      const { selection } = editor
      if (!selection) return
      startPointRef.current = Range.isBackward(selection) ? selection.focus : selection.anchor
      IS_MOUSEDOWN.set(editor, true)
      editor.onSelectStart()
    },
    [editor],
  )

  return (
    <div
      style={{
        ...style,
        position: 'relative',
      }}
    >
      <Component
        role={readOnly ? undefined : 'textbox'}
        {...attributes}
        {...{ [DATA_EDITABLE_NODE]: 'editor' }}
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
        onTouchStart={isTouchDevice ? handleRootTouchStart : undefined}
        onMouseDown={isTouchDevice ? undefined : handleRootMouseDown}
        onMouseUp={handleRootMouseUp}
        onClick={handleMultipleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onContextMenu={handleContextMenu}
      >
        <Children renderPlaceholder={renderPlaceholder} />
      </Component>
      <Shadow ref={current => EDITOR_TO_SHADOW.set(editor, current)}>
        <CaretComponent />
        <DragCaretComponent />
        <SelectionComponent />
        <InputComponent />
      </Shadow>
      <TouchPointComponent
        onAnchorTouchStart={handleAnchorTouchPointStart}
        onFocusTouchStart={handleFocusTouchPointStart}
      />
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
