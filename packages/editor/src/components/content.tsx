import React, { useEffect, useRef, useState } from 'react'
import { Editor, Node, Range, Transforms, Point, Selection } from 'slate'
import scrollIntoView from 'scroll-into-view-if-needed'

import useChildren from '../hooks/use-children'
import { Editable } from '..'
import { ReadOnlyContext } from '../hooks/use-read-only'
import { useEditable } from '../hooks/use-editable'
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
} from '../utils/weak-maps'
import { getWordRange } from '../utils/text'
import { useMultipleClick } from '../hooks/use-multiple-click'
import { SelectionStyle } from '../plugin/editable'
import { useFocused } from '../hooks/use-focused'
import Shadow from './shadow'
import { CaretComponent } from './caret'
import { SelectionComponent } from './selection'
import { InputComponent } from './input'

const Children = (props: Parameters<typeof useChildren>[0]) => (
  <React.Fragment>{useChildren(props)}</React.Fragment>
)

const SELECTION_DEFAULT_BLUR_COLOR = 'rgba(136, 136, 136, 0.3)'
const SELECTION_DEFAULT_FOCUS_COLOR = 'rgba(0,127,255,0.3)'
const SELECTION_DEFAULT_CARET_COLOR = '#000'
const SELECTION_DEFAULT_CARET_WIDTH = 1

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
  },
): Required<SelectionStyle> => {
  return Object.assign({}, oldStyle, selectionStyle) as Required<SelectionStyle>
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
  const editor = useEditable()
  // 当前编辑器 selection 对象，设置后重绘光标位置
  const [drawSelection, setDrawSelection] = useState<Selection>(null)
  const [drawSelectionStyle, setDrawSelectionStyle] = useState(
    mergeSelectionStyle(selectionStyle ?? {}),
  )
  const [isDrawSelection, setIsDrawSelection] = useState(true)

  const ref = useRef<HTMLDivElement>(null)

  // Update internal state on each render.
  IS_READ_ONLY.set(editor, readOnly)
  EDITOR_TO_PLACEHOLDER.set(editor, placeholder ?? '')
  IS_DRAW_SELECTION.set(editor, setIsDrawSelection)

  // Whenever the editor updates...
  useIsomorphicLayoutEffect(() => {
    // Update element-related weak maps with the DOM element ref.
    let window
    if (ref.current && (window = getDefaultView(ref.current))) {
      EDITOR_TO_WINDOW.set(editor, window)
      EDITOR_TO_ELEMENT.set(editor, ref.current)
      NODE_TO_ELEMENT.set(editor, ref.current)
      ELEMENT_TO_NODE.set(ref.current, editor)
    } else {
      NODE_TO_ELEMENT.delete(editor)
    }
  })

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
      const range = handleSelecting(Editable.findEventPoint(editor, event), !isContextMenu.current)
      if (range) editor.onSelectEnd()
    }
    isContextMenu.current = false
    IS_MOUSEDOWN.set(editor, false)
  }

  const handleDocumentMouseMove = (event: MouseEvent) => {
    const isMouseDown = IS_MOUSEDOWN.get(editor)
    if (event.button !== 0 || !isMouseDown || event.defaultPrevented || isContextMenu.current)
      return
    const point = Editable.findEventPoint(editor, event)
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
        startPointRef.current = point
        if (event.button === 2) {
          isContextMenu.current = true
        }
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

  useIsomorphicLayoutEffect(() => {
    const { onChange } = editor
    editor.onChange = () => {
      const { selection } = editor
      onChange()
      setDrawSelection(selection ? { ...selection } : null)
    }

    const handleShift = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'shift') {
        IS_SHIFT_PRESSED.set(editor, false)
      }
    }
    window.addEventListener('keyup', handleShift)
    window.addEventListener('mousedown', handleDocumentMouseDown)
    window.addEventListener('mouseup', handleDocumentMouseUp)
    window.addEventListener('mousemove', handleDocumentMouseMove)

    const destory = editor.onRenderFinish()

    return () => {
      window.removeEventListener('keyup', handleShift)
      window.removeEventListener('mousedown', handleDocumentMouseDown)
      window.removeEventListener('mouseup', handleDocumentMouseUp)
      window.removeEventListener('mousemove', handleDocumentMouseMove)
      if (destory) destory()
    }
  }, [editor])

  return (
    <ReadOnlyContext.Provider value={readOnly}>
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
          wordWrap: 'break-word',
          // Allow for passed-in styles to override anything.
          ...style,
        }}
        onMouseDown={handleRootMouseDown}
        onClick={handleMultipleClick}
      >
        <Children node={editor} selection={editor.selection} />
      </Component>
      <Shadow ref={current => EDITOR_TO_SHADOW.set(editor, current)}>
        {isDrawSelection && (
          <CaretComponent
            selection={drawSelection}
            width={drawSelectionStyle?.caretWidth}
            color={drawSelectionStyle?.caretColor}
          />
        )}
        {isDrawSelection && (
          <SelectionComponent
            selection={drawSelection}
            color={focused ? drawSelectionStyle?.focusColor : drawSelectionStyle?.blurColor}
          />
        )}
        <InputComponent selection={drawSelection} />
      </Shadow>
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
