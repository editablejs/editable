import React, { useEffect, useRef, useMemo, useState, useContext } from 'react'
import getDirection from 'direction'
import {
  Editor,
  Element,
  NodeEntry,
  Node,
  Range,
  Text,
  Transforms,
  Point,
  BaseSelection,
} from 'slate'
import scrollIntoView from 'scroll-into-view-if-needed'

import useChildren from '../hooks/use-children'
import { ReactEditor } from '..'
import { ReadOnlyContext } from '../hooks/use-read-only'
import { useSlate } from '../hooks/use-slate'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { DecorateContext } from '../hooks/use-decorate'
import {
  DOMNode,
  DOMRange,
  getDefaultView,
  isDOMNode,
} from '../utils/dom'
import Hotkeys from '../utils/hotkeys'
import {
  EDITOR_TO_ELEMENT,
  ELEMENT_TO_NODE,
  IS_READ_ONLY,
  NODE_TO_ELEMENT,
  IS_FOCUSED,
  PLACEHOLDER_SYMBOL,
  EDITOR_TO_WINDOW,
  IS_COMPOSING,
} from '../utils/weak-maps'
import Shadow, { DrawRect, ShadowBox } from './shadow'
import { SlateSelectorContext } from '../hooks/use-slate-selector'

const Children = (props: Parameters<typeof useChildren>[0]) => (
  <React.Fragment>{useChildren(props)}</React.Fragment>
)

export interface SelectionStyle {
  focusBgColor?: string
  blurBgColor?: string
  caretColor?: string
  caretWidth?: number
}

const SELECTION_DEFAULT_BLUR_BG_COLOR = 'rgba(136, 136, 136, 0.3)'
const SELECTION_DEFAULT_FOCUS_BG_COLOR = 'rgba(0,127,255,0.3)'
const SELECTION_DEFAULT_CARET_COLOR = '#000'
const SELECTION_DEFAULT_CARET_WIDTH = 2

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
  leaf: Text
  text: Text
  attributes: {
    'data-slate-leaf': true
  }
}

/**
 * `EditableProps` are passed to the `<Editable>` component.
 */

export type EditableProps = {
  autoFocus?: boolean
  decorate?: (entry: NodeEntry) => Range[]
  placeholder?: string
  readOnly?: boolean
  role?: string
  style?: React.CSSProperties
  renderElement?: (props: RenderElementProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  renderPlaceholder?: (props: RenderPlaceholderProps) => JSX.Element
  scrollSelectionIntoView?: (editor: ReactEditor, domRange: DOMRange) => void
  as?: React.ElementType
  selectionStyle?: SelectionStyle
  onFocus?: () => void
  onBlur?: () => void
  onKeydown?: (event: React.KeyboardEvent) => void
  onKeyup?: (event: React.KeyboardEvent) => void
  onBeforeInput?: (event: React.FormEvent<HTMLTextAreaElement>) => void
  onInput?: (event: React.FormEvent<HTMLTextAreaElement>) => void
  onCompositionStart?: (event: React.CompositionEvent) => void
  onCompositionEnd?: (event: React.CompositionEvent) => void
  onSelectStart?: () => void
  onSelecting?: () => void
  onSelectEnd?: () => void
}

/**
 * Editable.
 */

export const Editable = (props: EditableProps) => {
  const {
    autoFocus,
    decorate = defaultDecorate,
    placeholder,
    readOnly = false,
    renderElement,
    renderLeaf,
    renderPlaceholder = props => <DefaultPlaceholder {...props} />,
    scrollSelectionIntoView = defaultScrollSelectionIntoView,
    style = {},
    as: Component = 'div',
    selectionStyle,
    onFocus,
    onBlur,
    onKeydown,
    onKeyup,
    onBeforeInput,
    onInput,
    onCompositionStart,
    onCompositionEnd,
    onSelectStart,
    onSelecting,
    onSelectEnd,
    ...attributes
  } = props
  const editor = useSlate()
  // 当前编辑器 selection 对象，设置后重绘光标位置
  const [currentSelection, setCurrentSelection] = useState<BaseSelection>()

  const ref = useRef<HTMLDivElement>(null)
  // Update internal state on each render.
  IS_READ_ONLY.set(editor, readOnly)

  // Whenever the editor updates...
  useIsomorphicLayoutEffect(() => {
    // Update element-related weak maps with the DOM element ref.
    let window
    if (ref.current && (window = getDefaultView(ref.current))) {
      EDITOR_TO_WINDOW.set(editor, window)
      EDITOR_TO_ELEMENT.set(editor, ref.current)
      NODE_TO_ELEMENT.set(editor, ref.current)
      ELEMENT_TO_NODE.set(ref.current, editor)
      
      ref.current.focus = () => {
        textareaRef.current?.focus({
          preventScroll: true
        })
      }

      ref.current.blur = () => {
        textareaRef.current?.blur()
      }
    } else {
      NODE_TO_ELEMENT.delete(editor)
    }
  })

  // The autoFocus TextareaHTMLAttribute doesn't do anything on a div, so it
  // needs to be manually focused.
  useEffect(() => {
    if (ref.current && autoFocus) {
      ref.current.focus()
    }
  }, [autoFocus])

  const decorations = decorate([editor, []])

  if (
    placeholder &&
    editor.children.length === 1 &&
    Array.from(Node.texts(editor)).length === 1 &&
    Node.string(editor) === '' &&
    !IS_COMPOSING.get(editor)
  ) {
    const start = Editor.start(editor, [])
    decorations.push({
      [PLACEHOLDER_SYMBOL]: true,
      placeholder,
      anchor: start,
      focus: start,
    })
  }

  const [ caretRect, setCaretRect ] = useState<DrawRect | null>(null)
  const [ boxRects, setBoxRects ] = useState<DrawRect[]>([])
  const [ textareaRect, setTextareaRect ] = useState<DrawRect | null>(null)

  const isRootMouseDown = useRef(false)
  const startPointRef = useRef<Point | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const drawStyle = useMemo(() => Object.assign({}, {
    focusBgColor: SELECTION_DEFAULT_FOCUS_BG_COLOR,
    blurBgColor: SELECTION_DEFAULT_BLUR_BG_COLOR,
    caretColor: SELECTION_DEFAULT_CARET_COLOR,
    caretWidth: SELECTION_DEFAULT_CARET_WIDTH
  }, selectionStyle), [selectionStyle])

  const changeFocus = (focus: boolean) => {
    if(IS_FOCUSED.get(editor) === focus) return
    IS_FOCUSED.set(editor, focus)
    if(focus) {
      if(onFocus) onFocus()
    } else {
      if(onBlur) onBlur()
    }
    if(!focus) setCaretRect(null)
    else {
      setCurrentSelection(selection => selection ? ({ ...selection }) : null)
    }
    setBoxRects(rects => {
      return rects.map(rect => {
        rect.color = focus ? drawStyle.focusBgColor : drawStyle.blurBgColor
        return rect
      })
    })
  }

  const handleDocumentMouseDown = (event: MouseEvent) => {
    if(!isRootMouseDown.current && !event.defaultPrevented) changeFocus(false)
  }

  const handleDocumentMouseUp = (event: MouseEvent) => {
    isRootMouseDown.current = false
    document.removeEventListener('mousemove', handleDocumentMouseMove);
    if(isRootMouseDown.current) {
      const range = handleSelecting(ReactEditor.findEventPoint(editor, event))
      if(range && onSelectEnd) onSelectEnd()
    }
  }

  const handleDocumentMouseMove = (event: MouseEvent) => { 
    const point = ReactEditor.findEventPoint(editor, event)
    const range = handleSelecting(point)
    if(range && onSelecting) onSelecting()
  }

  const handleSelecting = (point: Point | null) => { 
    if(!startPointRef.current || !point) return
    const anchor = startPointRef.current
    const range: Range = { anchor, focus: point }
    if(editor.selection && Range.equals(range, editor.selection)) {
      ReactEditor.focus(editor)
      return
    }
    Transforms.select(editor, range)
    return range
  }

  const handleRootMouseDown = (event: MouseEvent) => {
    isRootMouseDown.current = true
    changeFocus(true)
    const point = ReactEditor.findEventPoint(editor, event)
    if(point) {
      startPointRef.current = point
      const range = handleSelecting(point)
      if(range && onSelectStart) onSelectStart()
    }
    else startPointRef.current = null
    if(event.button === 0) {
      document.addEventListener('mousemove', handleDocumentMouseMove);
    }
  }

  const handleKeydown = (event: React.KeyboardEvent) => { 
    const { nativeEvent } = event
    // COMPAT: The composition end event isn't fired reliably in all browsers,
    // so we sometimes might end up stuck in a composition state even though we
    // aren't composing any more.
    if (
      ReactEditor.isComposing(editor) &&
      nativeEvent.isComposing === false
    ) {
      IS_COMPOSING.set(editor, false)
    }

    if (
      isEventHandled(event, onKeydown) ||
      ReactEditor.isComposing(editor)
    ) {
      return
    }

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
    if (Hotkeys.isRedo(nativeEvent)) {
      event.preventDefault()
      const maybeHistoryEditor: any = editor

      if (typeof maybeHistoryEditor.redo === 'function') {
        maybeHistoryEditor.redo()
      }

      return
    }

    if (Hotkeys.isUndo(nativeEvent)) {
      event.preventDefault()
      const maybeHistoryEditor: any = editor

      if (typeof maybeHistoryEditor.undo === 'function') {
        maybeHistoryEditor.undo()
      }

      return
    }

    // COMPAT: Certain browsers don't handle the selection updates
    // properly. In Chrome, the selection isn't properly extended.
    // And in Firefox, the selection isn't properly collapsed.
    // (2017/10/17)
    if (Hotkeys.isMoveLineBackward(nativeEvent)) {
      event.preventDefault()
      Transforms.move(editor, { unit: 'line', reverse: true })
      return
    }

    if (Hotkeys.isMoveLineForward(nativeEvent)) {
      event.preventDefault()
      Transforms.move(editor, { unit: 'line' })
      return
    }

    if (Hotkeys.isExtendLineBackward(nativeEvent)) {
      event.preventDefault()
      Transforms.move(editor, {
        unit: 'line',
        edge: 'focus',
        reverse: true,
      })
      return
    }

    if (Hotkeys.isExtendLineForward(nativeEvent)) {
      event.preventDefault()
      Transforms.move(editor, { unit: 'line', edge: 'focus' })
      return
    }

    // COMPAT: If a void node is selected, or a zero-width text node
    // adjacent to an inline is selected, we need to handle these
    // hotkeys manually because browsers won't be able to skip over
    // the void node with the zero-width space not being an empty
    // string.
    if (Hotkeys.isMoveBackward(nativeEvent)) {
      event.preventDefault()

      if (selection && Range.isCollapsed(selection)) {
        Transforms.move(editor, { reverse: !isRTL })
      } else {
        Transforms.collapse(editor, { edge: 'start' })
      }

      return
    }

    if (Hotkeys.isMoveForward(nativeEvent)) {
      event.preventDefault()

      if (selection && Range.isCollapsed(selection)) {
        Transforms.move(editor, { reverse: isRTL })
      } else {
        Transforms.collapse(editor, { edge: 'end' })
      }

      return
    }

    if (Hotkeys.isMoveWordBackward(nativeEvent)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Transforms.collapse(editor, { edge: 'focus' })
      }

      Transforms.move(editor, { unit: 'word', reverse: !isRTL })
      return
    }

    if (Hotkeys.isMoveWordForward(nativeEvent)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Transforms.collapse(editor, { edge: 'focus' })
      }

      Transforms.move(editor, { unit: 'word', reverse: isRTL })
      return
    }

    if (Hotkeys.isSoftBreak(nativeEvent)) {
      event.preventDefault()
      Editor.insertSoftBreak(editor)
      return
    }

    if (Hotkeys.isSplitBlock(nativeEvent)) {
      event.preventDefault()
      Editor.insertBreak(editor)
      return
    }

    if (Hotkeys.isDeleteBackward(nativeEvent)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'backward' })
      } else {
        Editor.deleteBackward(editor)
      }

      return
    }

    if (Hotkeys.isDeleteForward(nativeEvent)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'forward' })
      } else {
        Editor.deleteForward(editor)
      }

      return
    }

    if (Hotkeys.isDeleteLineBackward(nativeEvent)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'backward' })
      } else {
        Editor.deleteBackward(editor, { unit: 'line' })
      }

      return
    }

    if (Hotkeys.isDeleteLineForward(nativeEvent)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'forward' })
      } else {
        Editor.deleteForward(editor, { unit: 'line' })
      }

      return
    }

    if (Hotkeys.isDeleteWordBackward(nativeEvent)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'backward' })
      } else {
        Editor.deleteBackward(editor, { unit: 'word' })
      }

      return
    }

    if (Hotkeys.isDeleteWordForward(nativeEvent)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'forward' })
      } else {
        Editor.deleteForward(editor, { unit: 'word' })
      }

      return
    }
  }

  const handleKeyup = (event: React.KeyboardEvent) => { 
    if(onKeyup) onKeyup(event)
  }

  const handleBlur = () => {
    if(!isRootMouseDown.current) changeFocus(false)
  }

  const handleBeforeInput = (event: React.FormEvent<HTMLTextAreaElement>) => { 
    if(onBeforeInput) onBeforeInput(event)
  }

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => { 
    const textarea = event.target
    if(!(textarea instanceof HTMLTextAreaElement)) return
    const value = textarea.value
    if(!IS_COMPOSING.get(editor)) {
      textarea.value = ''
    }

    if(!isEventHandled(event, onInput)) {
      const { selection } = editor
      if(!selection) return
      if(IS_COMPOSING.get(editor)) {
        const [node, path] = Editor.node(editor, selection)
        if(Text.isText(node)) {
          if(Range.isExpanded(selection)) { 
            Editor.deleteFragment(editor)
          }
          const offset = node.composition?.offset ?? selection.anchor.offset
          Transforms.setNodes<Text>(editor, {
            composition: {
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
  }

  const handleCompositionStart = (ev: React.CompositionEvent) => {
    IS_COMPOSING.set(editor, true)
    if(onCompositionStart) onCompositionStart(ev)
  }

  const handleCompositionEnd = (ev: React.CompositionEvent) => { 
    IS_COMPOSING.set(editor, false)
    const textarea = ev.target
    if(!(textarea instanceof HTMLTextAreaElement)) return
    const value = textarea.value
    textarea.value = ''
    if(!isEventHandled(ev, onCompositionEnd)) {
      const { selection } = editor
      if(!selection) return
      const [node, path] = Editor.node(editor, selection)
      if(Text.isText(node)) {
        const { composition } = node
        Transforms.setNodes<Text>(editor, {
          composition: undefined,
        }, { at: path })
        const point = { path, offset: composition?.offset ?? selection.anchor.offset}
        Transforms.select(editor, point)
        Transforms.insertText(editor, value)
      }
    }
  }

  const selectorContext = useContext(SlateSelectorContext)

  useIsomorphicLayoutEffect(() => {
    selectorContext.addEventListener(() => {
      const { selection } = editor
      setCurrentSelection(selection)
    })
    const root = EDITOR_TO_ELEMENT.get(editor)
    document.addEventListener('mousedown', handleDocumentMouseDown)
    document.addEventListener('mouseup', handleDocumentMouseUp)

    root?.addEventListener('mousedown', handleRootMouseDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown)
      document.removeEventListener('mouseup', handleDocumentMouseUp)

      root?.removeEventListener('mousedown', handleRootMouseDown)
    }
  }, [selectorContext, editor])

  useIsomorphicLayoutEffect(() => {
    if(!currentSelection) {
      setCaretRect(null)
      setTextareaRect(null)
    } else {
      const domRange = ReactEditor.toDOMRange(editor, currentSelection)
      drawCaret(domRange)
      drawBoxs(domRange)
    }
  }, [currentSelection])

  const drawCaret = (range: DOMRange) => { 
    const rects = range.getClientRects()
    if(rects.length === 0 || !range.collapsed || !IS_FOCUSED.get(editor)) return setCaretRect(null)
    const caretRect = Object.assign({}, rects[0].toJSON(), {  width: drawStyle.caretWidth, color: drawStyle.caretColor })
    setCaretRect(caretRect)
    setTextareaRect(caretRect)
  }

  const drawBoxs = (range: DOMRange) => { 
    if(range.collapsed) return setBoxRects([])
    const rects = range.getClientRects()
    const drawRects: DrawRect[] = []
    if(rects) {
      const indexs: number[] = []
      const findSameLocation = (x: number, y: number, index: number) => { 
        for(let r = 0; r < rects.length; r++) {
          if(~indexs.indexOf(r)) continue
          const rect = rects[r]
          if(rect.x === x && rect.y === y && r !== index) return rect
        }
        return null
      }
      for(let i = 0; i < rects.length; i++) {
        const rect = rects.item(i)
        if(rect) {
          const sameLocation = findSameLocation(rect.x, rect.y, i)
          if(sameLocation && rect.width >= sameLocation.width) {
            indexs.push(i)
            continue
          }
          drawRects.push(Object.assign({}, rect.toJSON(), { color: IS_FOCUSED.get(editor) ? drawStyle.focusBgColor : drawStyle.blurBgColor }))
        }
      }
    }
    setBoxRects(drawRects)
    setTextareaRect(drawRects[drawRects.length - 1])
  }

  return (
    <ReadOnlyContext.Provider value={readOnly}>
      <DecorateContext.Provider value={decorate}>
        <Component
          role={readOnly ? undefined : 'textbox'}
          {...attributes}
          data-slate-editor
          data-slate-node="value"
          // explicitly set this
          // in some cases, a decoration needs access to the range / selection to decorate a text node,
          // then you will select the whole text node when you select part the of text
          // this magic zIndex="-1" will fix it
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
        >
          <Children
            decorations={decorations}
            node={editor}
            renderElement={renderElement}
            renderPlaceholder={renderPlaceholder}
            renderLeaf={renderLeaf}
            selection={editor.selection}
          />
        </Component>
        <Shadow caretRects={caretRect ? [caretRect] : []} boxRects={boxRects}>
          {
            <ShadowBox rect={Object.assign({}, textareaRect, { color: 'transparent', width: 1 })} style={{ opacity:0, outline: 'none', caretColor: 'transparent', overflow: 'hidden'}}>
              <textarea 
              ref={textareaRef}
              rows={1} 
              style={{
                fontSize: 'inherit', 
                lineHeight: 1,
                padding: 0,
                border: 'none',
                whiteSpace: 'nowrap',
                width: '1em',
                overflow: 'auto',
                resize: 'vertical'
              }} 
              onKeyDown={handleKeydown}
              onKeyUp={handleKeyup}
              onBeforeInput={handleBeforeInput}
              onInput={handleInput}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onBlur={handleBlur}
              />
            </ShadowBox>
          }
        </Shadow>
      </DecorateContext.Provider>
    </ReadOnlyContext.Provider>
  )
}

/**
 * The props that get passed to renderPlaceholder
 */
export type RenderPlaceholderProps = {
  children: any
  attributes: {
    'data-slate-placeholder': boolean
    dir?: 'rtl'
    contentEditable: boolean
    ref: React.RefObject<any>
    style: React.CSSProperties
  }
}

/**
 * The default placeholder element
 */

export const DefaultPlaceholder = ({
  attributes,
  children,
}: RenderPlaceholderProps) => <span {...attributes}>{children}</span>

/**
 * A default memoized decorate function.
 */

export const defaultDecorate: (entry: NodeEntry) => Range[] = () => []

/**
 * A default implement to scroll dom range into view.
 */

const defaultScrollSelectionIntoView = (
  editor: ReactEditor,
  domRange: DOMRange
) => {
  // This was affecting the selection of multiple blocks and dragging behavior,
  // so enabled only if the selection has been collapsed.
  if (
    !editor.selection ||
    (editor.selection && Range.isCollapsed(editor.selection))
  ) {
    const leafEl = domRange.startContainer.parentElement!
    leafEl.getBoundingClientRect = domRange.getBoundingClientRect.bind(domRange)
    scrollIntoView(leafEl, {
      scrollMode: 'if-needed',
    })
    delete (leafEl as any).getBoundingClientRect
  }
}

/**
 * Check if the target is in the editor.
 */

export const hasTarget = (
  editor: ReactEditor,
  target: EventTarget | null
): target is DOMNode => {
  return isDOMNode(target) && ReactEditor.hasDOMNode(editor, target)
}

/**
 * Check if the target is editable and in the editor.
 */

export const hasEditableTarget = (
  editor: ReactEditor,
  target: EventTarget | null
): target is DOMNode => {
  return (
    isDOMNode(target) &&
    ReactEditor.hasDOMNode(editor, target)
  )
}

/**
 * Check if the target is inside void and in an non-readonly editor.
 */

export const isTargetInsideNonReadonlyVoid = (
  editor: ReactEditor,
  target: EventTarget | null
): boolean => {
  if (IS_READ_ONLY.get(editor)) return false
 
  const slateNode =
    hasTarget(editor, target) && ReactEditor.toSlateNode(editor, target)
  return Editor.isVoid(editor, slateNode)
}

/**
 * Check if an event is overrided by a handler.
 */

export const isEventHandled = <
  EventType extends React.SyntheticEvent<unknown, unknown>
>(
  event: EventType,
  handler?: (event: EventType) => void | boolean
) => {
  if (!handler) {
    return false
  }
  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event)

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled
  }

  return event.isDefaultPrevented() || event.isPropagationStopped()
}

/**
 * Check if a DOM event is overrided by a handler.
 */

export const isDOMEventHandled = <E extends Event>(
  event: E,
  handler?: (event: E) => void | boolean
) => {
  if (!handler) {
    return false
  }

  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event)

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled
  }
  
  return event.defaultPrevented
}
