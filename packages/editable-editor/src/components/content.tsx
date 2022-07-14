import React, { useEffect, useRef, useState, useContext, useMemo } from 'react'
import {
  Editor,
  NodeEntry,
  Node,
  Range,
  Transforms,
  Point,
  BaseSelection,
} from 'slate'
import scrollIntoView from 'scroll-into-view-if-needed'

import useChildren from '../hooks/use-children'
import { EditableEditor } from '..'
import { ReadOnlyContext } from '../hooks/use-read-only'
import { useSlate } from '../hooks/use-slate'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import {
  DOMRange,
  getDefaultView,
} from '../utils/dom'
import {
  EDITOR_TO_ELEMENT,
  ELEMENT_TO_NODE,
  IS_READ_ONLY,
  NODE_TO_ELEMENT,
  IS_FOCUSED,
  EDITOR_TO_WINDOW,
  IS_COMPOSING,
  IS_SHIFT_PRESSED,
  EDITOR_TO_PLACEHOLDER,
  EDITOR_TO_TEXTAREA,
  EDITOR_TO_SHADOW,
} from '../utils/weak-maps'
import Shadow, { DrawRect, ShadowBox } from './shadow'
import { getWordRange } from '../utils/string'
import useMultipleClick from '../hooks/use-multiple-click'
import { SelectionStyle } from '../plugin/editable-editor'

const Children = (props: Parameters<typeof useChildren>[0]) => (
  <React.Fragment>{useChildren(props)}</React.Fragment>
)

const SELECTION_DEFAULT_BLUR_BG_COLOR = 'rgba(136, 136, 136, 0.3)'
const SELECTION_DEFAULT_FOCUS_BG_COLOR = 'rgba(0,127,255,0.3)'
const SELECTION_DEFAULT_CARET_COLOR = '#000'
const SELECTION_DEFAULT_CARET_WIDTH = 2

/**
 * `EditableProps` are passed to the `<Editable>` component.
 */

export type EditableProps = {
  autoFocus?: boolean
  placeholder?: string
  readOnly?: boolean
  role?: string
  style?: React.CSSProperties
  scrollSelectionIntoView?: (editor: EditableEditor, domRange: DOMRange) => void
  as?: React.ElementType
  selectionStyle?: SelectionStyle
}

const mergeSelectionStyle = (selectionStyle: SelectionStyle, oldStyle: SelectionStyle = {
  focusBgColor: SELECTION_DEFAULT_FOCUS_BG_COLOR,
  blurBgColor: SELECTION_DEFAULT_BLUR_BG_COLOR,
  caretColor: SELECTION_DEFAULT_CARET_COLOR,
  caretWidth: SELECTION_DEFAULT_CARET_WIDTH
}): Required<SelectionStyle> => { 
  return Object.assign({},oldStyle , selectionStyle) as Required<SelectionStyle>
}

/**
 * Editable.
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
  const editor = useSlate()
  // 当前编辑器 selection 对象，设置后重绘光标位置
  const [currentSelection, setCurrentSelection] = useState<BaseSelection>()
  const [drawSelectionStyle, setDrawSelectionStyle] = useState(mergeSelectionStyle(selectionStyle ?? {}))
  const caretTimer = useRef<number>()
  const ref = useRef<HTMLDivElement>(null)
  const caretRef = useRef<HTMLDivElement>(null)
  const prevRange = useRef<DOMRange | null>(null)
  // Update internal state on each render.
  IS_READ_ONLY.set(editor, readOnly)
  EDITOR_TO_PLACEHOLDER.set(editor, placeholder ?? '')
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
      EditableEditor.focus(editor)
    }
  }, [editor, autoFocus])

  useEffect(() => {  
    editor.setSelectionStyle = style => {
      setDrawSelectionStyle(value => mergeSelectionStyle(style, value))
    }
  }, [editor])

  const [ caretRect, setCaretRect ] = useState<DrawRect | null>(null)
  const [ boxRects, setBoxRects ] = useState<DrawRect[]>([])
  const [ textareaRect, setTextareaRect ] = useState<DrawRect | null>(null)

  const isRootMouseDown = useRef(false)
  const startPointRef = useRef<Point | null>(null)

  const changeFocus = (focus: boolean) => {
    if(IS_FOCUSED.get(editor) === focus) return
    IS_FOCUSED.set(editor, focus)
    if(focus) {
      editor.onFocus()
    } else {
      editor.onBlur()
    }
    if(!focus) setCaretRect(null)
    setBoxRects(rects => {
      return rects.map(rect => {
        rect.color = focus ? drawSelectionStyle.focusBgColor : drawSelectionStyle.blurBgColor
        return rect
      })
    })
  }

  const handleDocumentMouseDown = (event: MouseEvent) => {
    if(!isRootMouseDown.current && !event.defaultPrevented) changeFocus(false)
  }

  const handleSelecting = (point: Point | null) => { 
    if(!startPointRef.current || !point) return
    const anchor = startPointRef.current
    const range: Range = { anchor, focus: point }
    if(editor.selection && Range.equals(range, editor.selection)) {
      EditableEditor.focus(editor)
      if(!caretRect) setCurrentSelection(selection => selection ? ({ ...selection }) : null)
      return
    }
    Transforms.select(editor, range)
    return range
  }

  const handleDocumentMouseUp = (event: MouseEvent) => {
    document.removeEventListener('mousemove', handleDocumentMouseMove);
    if(isRootMouseDown.current) {
      if(IS_FOCUSED.get(editor) && EDITOR_TO_SHADOW.get(editor) !== EDITOR_TO_TEXTAREA.get(editor)) {
        EditableEditor.focus(editor)
      }
      const range = handleSelecting(EditableEditor.findEventPoint(editor, event))
      if(range) editor.onSelectEnd()
    }
    isRootMouseDown.current = false
  }

  const handleDocumentMouseMove = (event: MouseEvent) => { 
    const point = EditableEditor.findEventPoint(editor, event)
    const range = handleSelecting(point)
    if(range)  editor.onSelecting()
  }

  const handleRootMouseDown = (event: MouseEvent) => {
    isRootMouseDown.current = true
    if(isDoubleClickRef.current) {
      if(isSamePoint(event)) {
        return
      } else {
        isDoubleClickRef.current = false
      }
    }
    changeFocus(true)
    const point = EditableEditor.findEventPoint(editor, event)
    if(point) {
      if(!IS_SHIFT_PRESSED.get(editor)) {
        startPointRef.current = point
      }
      const range = handleSelecting(point)
      if(range) editor.onSelectStart()
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
      EditableEditor.isComposing(editor) &&
      nativeEvent.isComposing === false
    ) {
      IS_COMPOSING.set(editor, false)
    }

    if (
      EditableEditor.isComposing(editor)
    ) {
      return
    }
    editor.onKeydown(nativeEvent)
  }

  const isDoubleClickRef = useRef(false)

  const { handleMultipleClick, isSamePoint } = useMultipleClick({
    onClick: () => {
      isDoubleClickRef.current = false
    },
    onMultipleClick: (event, count) => {
      event.preventDefault()
      const { selection } = editor
      if(!selection) return
      const { focus } = selection
      const { path: focusPath } = focus
      const focusNode = Node.get(editor, focusPath)
      if(count === 2) {
        const { text, offset } = EditableEditor.findTextOffsetOnLine(editor, focus)
        if(text) {
          const [startOffset, endOffset] = getWordRange(text, offset)
          Transforms.select(editor, {
            anchor: EditableEditor.findPointOnLine(editor, focusPath, startOffset),
            focus: EditableEditor.findPointOnLine(editor, focusPath, endOffset)
          })
          isDoubleClickRef.current = true
          setTimeout(() => {
            isDoubleClickRef.current = false
          }, 500);
          return
        }
      } else if(count === 3) {
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
    }
  })

  const handleKeyup = (event: React.KeyboardEvent) => { 
    editor.onKeyup(event.nativeEvent)
  }

  const handleBlur = () => {
    if(!isRootMouseDown.current) changeFocus(false)
  }

  const handleBeforeInput = (event: React.FormEvent<HTMLTextAreaElement>) => { 
    const textarea = event.target
    if(!(textarea instanceof HTMLTextAreaElement)) return
    editor.onBeforeInput(textarea.value)
  }

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => { 
    const textarea = event.target
    if(!(textarea instanceof HTMLTextAreaElement)) return
    const value = textarea.value
    if(!IS_COMPOSING.get(editor)) {
      textarea.value = ''
    }
    editor.onInput(value)
  }

  const handleCompositionStart = (ev: React.CompositionEvent) => {
    editor.onCompositionStart(ev.nativeEvent.data)
  }

  const handleCompositionEnd = (ev: React.CompositionEvent) => { 
    const textarea = ev.target
    if(!(textarea instanceof HTMLTextAreaElement)) return
    const value = textarea.value
    textarea.value = ''
    editor.onCompositionEnd(value)
  }

  useIsomorphicLayoutEffect(() => {
    const { onChange } = editor
    editor.onChange = () => { 
      const { selection } = editor
      onChange()
      setCurrentSelection(selection ? {...selection} : undefined)
    }
    const root = EDITOR_TO_ELEMENT.get(editor)
    console.log(root)
    document.addEventListener('mousedown', handleDocumentMouseDown)
    document.addEventListener('mouseup', handleDocumentMouseUp)

    root?.addEventListener('mousedown', handleRootMouseDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown)
      document.removeEventListener('mouseup', handleDocumentMouseUp)

      root?.removeEventListener('mousedown', handleRootMouseDown)
    }
  }, [editor])

  useIsomorphicLayoutEffect(() => {
    if(!currentSelection) {
      setCaretRect(null)
      setTextareaRect(null)
    } else {
      const range = EditableEditor.toDOMRange(editor, currentSelection)
      const pRange = prevRange.current
      if(pRange && pRange.startContainer === range.startContainer && pRange.startOffset === range.startOffset && pRange.endContainer === range.endContainer && pRange.endOffset === range.endOffset) {
        const clientRect = range.getBoundingClientRect()
        const pClientRect = pRange.getBoundingClientRect()
        const compare = (a: DOMRect, b: DOMRect) => a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height
        let isEqual = compare(clientRect, pClientRect)
        if(!isEqual) {
          const rects = range.getClientRects()
          const pRects = pRange.getClientRects()
          isEqual = rects.length === pRects.length
          for(let i = 0; i < rects.length && isEqual; i++) {
            const rect = rects[i]
            const pRect = pRects[i]
            if(!compare(rect, pRect)) {
              isEqual = false
            }
          }
        }
        if(isEqual) return
        prevRange.current = range
      } else {
        prevRange.current = range
      }
      drawCaret(range)
      drawBoxs(range)
    }
  }, [editor, currentSelection])

  const drawCaret = (range: DOMRange) => { 
    let rects
    if(!range.collapsed || !IS_FOCUSED.get(editor) || (rects = range.getClientRects()).length === 0) return setCaretRect(null)
    const rect = Object.assign({}, rects[0].toJSON(), {  width: drawSelectionStyle.caretWidth, color: drawSelectionStyle.caretColor  })
    setCaretRect(rect)
    setTextareaRect(rect)
  }

  useIsomorphicLayoutEffect(() => {
    const clearActive = () => {
      clearTimeout(caretTimer.current)
    }

    const changeOpacity = (opacity?: number) => { 
      const elRef = caretRef.current
      if(elRef) {
        elRef.style.opacity = opacity !== undefined ? String(opacity) : (elRef.style.opacity === '1' ? '0' : '1')
      }
    }
    const activeCaret = (opacity?: number) => {
      clearActive()
      if(!caretRect) return 
      if(isRootMouseDown.current) {
        changeOpacity(1)
      } else {
        changeOpacity(opacity)
      }
      caretTimer.current = setTimeout(() => { 
        activeCaret()
      }, 530)
    }
    activeCaret(1)
    return () => clearActive()
  },[caretRect])

  const drawBoxs = (range: DOMRange) => { 
    if(range.collapsed) return setBoxRects([])
    const rects = range.getClientRects()
    const drawRects: DrawRect[] = []
    if(rects) {
      const indexs: number[] = []
      const findSamePoint = (x: number, y: number, index: number) => { 
        for(let r = 0; r < rects.length; r++) {
          if(~indexs.indexOf(r)) continue
          const rect = rects[r]
          if(rect.x === x && rect.y === y && r !== index) return rect
        }
        return null
      }
      for(let i = 0; i < rects.length; i++) {
        const rect = rects[i]
        if(rect && rect.width > 0) {
          const point = findSamePoint(rect.x, rect.y, i)
          if(point && rect.width >= point.width) {
            indexs.push(i)
            continue
          }
          drawRects.push(Object.assign({}, rect.toJSON(), { color: IS_FOCUSED.get(editor) ? drawSelectionStyle.focusBgColor : drawSelectionStyle.blurBgColor }))
        }
      }
    }
    setBoxRects(drawRects)
    setTextareaRect(drawRects[drawRects.length - 1])
  }

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
        onClick={handleMultipleClick}
      >
        <Children
          node={editor}
          selection={editor.selection}
        />
      </Component>
      <Shadow ref={current => EDITOR_TO_SHADOW.set(editor, current)}>
        {
          <ShadowBox rect={caretRect || { width: 0, height: 0, top: 0, left: 0}} ref={caretRef} style={{ willChange: 'opacity, transform', opacity: caretRect ? 1 : 0 }} />
        }
        {
          boxRects.map((rect, index) => <ShadowBox key={index} rect={rect} style={{ willChange: 'transform', ...rect.style }} />)
        }
        {
          <ShadowBox rect={Object.assign({}, textareaRect, { color: 'transparent', width: 1})} style={{ opacity: 0, outline: 'none', caretColor: 'transparent', overflow: 'hidden'}}>
            <textarea 
            ref={current => {
              if(current) EDITOR_TO_TEXTAREA.set(editor, current)
            }}
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
    </ReadOnlyContext.Provider>
  )
}

/**
 * A default implement to scroll dom range into view.
 */
const defaultScrollSelectionIntoView = (
  editor: EditableEditor,
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

