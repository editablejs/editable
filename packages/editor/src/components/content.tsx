import * as React from 'react'
import {
  Editor,
  Range,
  Transforms,
  Point,
  Path,
  Element,
  DOMNode,
  getDefaultView,
  isDOMNode,
} from '@editablejs/models'

import useChildren from '../hooks/use-children'
import { useEditable, useEditableStatic } from '../hooks/use-editable'
import { Editable } from '../plugin/editable'
import { useReadOnly } from '../hooks/use-read-only'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { inAbsoluteDOMElement } from '../utils/dom'
import {
  EDITOR_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  IS_SHIFT_PRESSED,
  EDITOR_TO_SHADOW,
  IS_MOUSEDOWN,
  IS_TOUCHMOVING,
  IS_TOUCHING,
  IS_TOUCH_HOLD,
} from '../utils/weak-maps'
import { useMultipleClick } from '../hooks/use-multiple-click'
import { Focused, useFocused } from '../hooks/use-focused'
import ShadowContainer from './shadow'
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
import { Locale } from '../plugin/locale'

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
  readOnly?: boolean
  lang?: string
  autoFocus?: boolean
  placeholder?: React.ReactNode
  role?: string
  style?: React.CSSProperties
  as?: React.ElementType
  selectionDrawingStyle?: SelectionDrawingStyle
}

/**
 * ContentEditable.
 */
export const ContentEditable = (props: EditableProps) => {
  const {
    autoFocus = true,
    placeholder,
    readOnly: readOnlyProp = false,
    lang,
    style = {},
    as: Component = 'div',
    selectionDrawingStyle: selectionDrawingStyleProp,
    ...attributes
  } = props
  const editor = useEditableStatic()

  const ref = React.useRef<HTMLDivElement>(null)
  const [readOnly, setReadOnly] = useReadOnly()
  // 标记是否是刚拖拽完毕
  const isDragEnded = React.useRef(false)
  const dragTo = useDragTo()
  const dragging = useDragging()
  const { getDrag, setDrag } = useDragMethods()

  const [rendered, setRendered] = React.useState(false)

  // Touch hold timer
  const touchHoldTimer = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (placeholder && !readOnly) {
      const unsubscribe = Placeholder.subscribe(
        editor,
        ([node]) => {
          if (Editable.isEditor(node) && !node.children.some(n => Editor.isList(editor, n)))
            return () => placeholder
        },
        true,
      )

      return () => {
        unsubscribe()
      }
    }
  }, [editor, placeholder, readOnly])

  useIsomorphicLayoutEffect(() => {
    setReadOnly(readOnlyProp)
  }, [readOnlyProp])

  useIsomorphicLayoutEffect(() => {
    Locale.setLang(editor, props.lang || 'en-US')
  }, [editor, lang])

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
    const isTouching = IS_TOUCHING.get(editor)
    if (!isMouseDown && !isTouching && !event.defaultPrevented) setFocused(false)
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
      return true
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
    } else if (IS_TOUCH_HOLD.get(editor)) {
      IS_TOUCHING.set(editor, false)
      IS_MOUSEDOWN.set(editor, false)
      IS_TOUCH_HOLD.set(editor, false)
      event.preventDefault()
      editor.onTouchHold(event)
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
      let isSelectedSame = false
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
        const { selection } = editor
        if (
          IS_TOUCHING.get(editor) &&
          point &&
          selection &&
          isSelectedOnCurrentSelection(editor, selection, point)
        ) {
          isSelectedSame = true
        } else {
          // 是否选中在同一个位置
          isSelectedSame =
            handleSelecting(point, !isContextMenu.current, !isEditableDOMElement(event.target)) ===
            true
        }
      }
      // 修复 touch 时，触发了 mouse up 事件，导致无法触发 onSelectStart
      if (IS_TOUCHING.get(editor) && !IS_TOUCH_HOLD.get(editor)) {
        // touch 在同一个位置，触发 onTouchTrack
        if (isSelectedSame) editor.onTouchTrack()
        else editor.onSelectStart()
      }
      setDrag(null)
      if (!isDragEnded.current && (!IS_TOUCHING.get(editor) || !isSelectedSame))
        editor.onSelectEnd()
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
    const isTouchMoving = isTouchEvent(event)
    IS_TOUCHMOVING.set(editor, isTouchMoving)

    if (
      !isTouchMoving &&
      !darg &&
      ((isMouseEvent(event) && event.button !== 0) ||
        !isMouseDown ||
        event.defaultPrevented ||
        isContextMenu.current)
    )
      return
    const point = event.defaultPrevented ? null : Editable.findEventPoint(editor, event)
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
    if (isTouchMoving) event.preventDefault()
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

    const { selection } = editor

    IS_TOUCHING.set(editor, true)
    IS_TOUCH_HOLD.set(editor, false)
    clearTouchHoldTimer()
    // touch hold
    touchHoldTimer.current = setTimeout(() => {
      IS_TOUCH_HOLD.set(editor, true)

      if (Focused.is(editor)) {
        handleRootMouseDown(event)
      } else if (!selection || Range.isCollapsed(selection)) {
        IS_TOUCHING.set(editor, false)
        const point = Editable.findEventPoint(editor, event)
        if (point)
          editor.selectWord({
            at: {
              anchor: point,
              focus: point,
            },
          })
      }
    }, 530)
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
        }
        // Perform drag on existing selection while selected.
        else if (
          selection &&
          focused &&
          isSelectedOnCurrentSelection(editor, selection, point, isTouchDevice)
        ) {
          // Drag not performed on touch devices.
          if (!isTouchDevice) {
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
          }
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
      const isCollapsed = Range.isCollapsed(selection)
      if (count === 1 && !isCollapsed) {
        return false
      } else if (count === 2) {
        editor.selectWord()
        isDoubleClickRef.current = true
        if (isDoubleClickTimerRef.current) clearTimeout(isDoubleClickTimerRef.current)
        isDoubleClickTimerRef.current = setTimeout(() => {
          isDoubleClickRef.current = false
        }, 500)
        return
      } else if (count === 3) {
        editor.selectLine()
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
  }, [editor, handleDocumentMouseDown, handleDocumentMouseMove, handleDocumentMouseUp])

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
    if (readOnly) return
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
    if (readOnly) return
    const point = Editable.findEventPoint(editor, event)
    if (point) {
      Transforms.select(editor, point)
      const clipboardEvent = new ClipboardEvent('paset', { clipboardData: event.dataTransfer })
      editor.onPaste(clipboardEvent)
    }
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    if (!isTouchDevice) editor.onContextMenu(event.nativeEvent)
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
      event.stopPropagation()
      const { selection } = editor
      if (!selection) return
      startPointRef.current = Range.end(selection)
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
      startPointRef.current = Range.start(selection)
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
      <ShadowContainer ref={current => EDITOR_TO_SHADOW.set(editor, current)}>
        <CaretComponent />
        <DragCaretComponent />
        <SelectionComponent />
        <InputComponent autoFocus={autoFocus} />
      </ShadowContainer>
      <TouchPointComponent
        onAnchorTouchStart={handleAnchorTouchPointStart}
        onFocusTouchStart={handleFocusTouchPointStart}
      />
      {rendered && <Slots />}
    </div>
  )
}

const isSelectedOnCurrentSelection = (
  editor: Editor,
  selection: Range,
  point: Point,
  compareOnCollapsed = false,
) => {
  return (
    (Range.includes(selection, point) &&
      ((!Point.equals(Range.end(selection), point) &&
        !Point.equals(Range.start(selection), point)) ||
        (Range.isCollapsed(selection) &&
          !!Editor.above(editor, { match: n => Editor.isVoid(editor, n) })))) ||
    (compareOnCollapsed &&
      Range.isCollapsed(selection) &&
      Point.equals(Range.start(selection), point))
  )
}
