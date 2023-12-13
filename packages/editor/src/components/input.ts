import { Range } from '@editablejs/models'
import { Editable } from '../plugin/editable'
import {
  EDITOR_TO_INPUT,
  IS_COMPOSING,
  IS_MOUSEDOWN,
  IS_PASTE_TEXT,
  IS_TOUCHING,
} from '../utils/weak-maps'
import { useFocused } from '../hooks/use-focused'
import { ShadowBlock, ShadowRect } from './shadow'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { useEditableStatic } from '../hooks/use-editable'
import {
  useSelectionDrawingSelection,
  useSelectionDrawingRects,
} from '../hooks/use-selection-drawing'
import { ReadOnly, useReadOnly } from '../hooks/use-read-only'
import { composeEventHandlers } from '../utils/event'
import { useEffect, useRef, useState, virtual, TargetedEvent, html } from 'rezon'
import { ref } from 'rezon/directives/ref'

interface InputProps {
  autoFocus?: boolean
}

const InputComponent = virtual<InputProps>(({ autoFocus }) => {
  const editor = useEditableStatic()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useFocused()
  const [readOnly] = useReadOnly()

  const [rect, setRect] = useState<ShadowRect | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (inputRef.current) EDITOR_TO_INPUT.set(editor, inputRef.current)
    return () => {
      EDITOR_TO_INPUT.delete(editor)
    }
  }, [editor])

  useEffect(() => {
    if (autoFocus) {
      // editor.focus()
      // Editable.scrollIntoView(editor)
    }
  }, [editor, autoFocus])

  const handleKeydown = (event: KeyboardEvent) => {
    if (Editable.isComposing(editor) && event.isComposing === false) {
      IS_COMPOSING.set(editor, false)
    }

    if (event.defaultPrevented || Editable.isComposing(editor)) {
      return
    }
    editor.onKeydown(event)
  }

  const handleKeyup = (event: KeyboardEvent) => {
    editor.onKeyup(event)
  }

  const handleBlur = () => {
    if (!IS_MOUSEDOWN.get(editor) && !IS_TOUCHING.get(editor)) setFocused(false)
  }

  const handleFocus = () => {
    setFocused(true)
  }

  const handleBeforeInput = (event: TargetedEvent<HTMLTextAreaElement>) => {
    const textarea = event.target
    if (!(textarea instanceof HTMLTextAreaElement)) return
    const { value } = textarea
    editor.onBeforeInput(value)
  }

  const handleInput = (event: TargetedEvent<HTMLTextAreaElement>) => {
    const textarea = event.target
    if (!(textarea instanceof HTMLTextAreaElement)) return
    const value = textarea.value
    if (!IS_COMPOSING.get(editor)) {
      textarea.value = ''
    }
    editor.onInput(value)
  }

  const handleCompositionStart = (ev: CompositionEvent) => {
    const { data } = ev
    editor.onCompositionStart(data)
  }

  const handleCompositionEnd = (event: CompositionEvent) => {
    const textarea = event.target
    if (!(textarea instanceof HTMLTextAreaElement)) return
    const value = textarea.value
    textarea.value = ''
    editor.onCompositionEnd(value)
  }

  const handlePaste = (event: ClipboardEvent) => {
    composeEventHandlers(
      (event: ClipboardEvent) => {
        if (ReadOnly.is(editor)) {
          event.preventDefault()
        }
      },
      event => {
        const isPasteText = IS_PASTE_TEXT.get(editor)
        event.preventDefault()
        const e = new ClipboardEvent(isPasteText ? 'pasteText' : 'paste', event)
        editor.onPaste(e)
      },
    )(event)
  }

  const selection = useSelectionDrawingSelection()
  const rects = useSelectionDrawingRects()

  useIsomorphicLayoutEffect(() => {
    if (!selection || !focused || rects.length === 0) return setRect(null)
    if (Range.isCollapsed(selection)) {
      setRect(rects[0].toJSON())
    } else {
      const rect = rects[rects.length - 1].toJSON()
      rect.left = rect.left + rect.width
      return setRect(rect)
    }
  }, [focused, rects, selection])

  return ShadowBlock({
    rect: Object.assign({}, rect, { color: 'transparent', width: 1 }),
    style: { opacity: 0, outline: 'none', caretColor: 'transparent', overflow: 'hidden' },
    children: html`<textarea
      ref=${ref(inputRef)}
      rows="1"
      style="font-size:inherit;line-height:1;padding:0;border:none;white-space:nowrap;width:1em;overflow:auto;resize:vertical;"
      ?readonly=${readOnly}
      @keydown=${handleKeydown}
      @keyip=${handleKeyup}
      @beforeinput=${handleBeforeInput}
      @input=${handleInput}
      @compositionstart=${handleCompositionStart}
      @compositionend=${handleCompositionEnd}
      @blur=${handleBlur}
      @focus=${handleFocus}
      @paste=${handlePaste}
    />`,
  })
})

export { InputComponent }
