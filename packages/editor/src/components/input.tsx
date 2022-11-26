import { Range } from 'slate'
import { FC, useState } from 'react'
import { Editable } from '../plugin/editable'
import { EDITOR_TO_INPUT, IS_COMPOSING, IS_MOUSEDOWN } from '../utils/weak-maps'
import { useFocused } from '../hooks/use-focused'
import { ShadowRect } from './shadow'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { useEditableStatic } from '../hooks/use-editable-static'
import {
  useSelectionDrawingSelection,
  useSelectionDrawingRects,
} from '../hooks/use-selection-drawing'

interface InputProps {}

const InputComponent: FC<InputProps> = () => {
  const editor = useEditableStatic()

  const [focused, setFocused] = useFocused()

  const [rect, setRect] = useState<ShadowRect | null>(null)

  const handleKeydown = (event: React.KeyboardEvent) => {
    const { nativeEvent } = event
    if (Editable.isComposing(editor) && nativeEvent.isComposing === false) {
      IS_COMPOSING.set(editor, false)
    }

    if (event.defaultPrevented || Editable.isComposing(editor)) {
      return
    }
    editor.onKeydown(nativeEvent)
  }

  const handleKeyup = (event: React.KeyboardEvent) => {
    const { nativeEvent } = event
    editor.onKeyup(nativeEvent)
  }

  const handleBlur = () => {
    if (!IS_MOUSEDOWN.get(editor)) setFocused(false)
  }

  const handleFocus = () => {
    setFocused(true)
  }

  const handleBeforeInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.target
    if (!(textarea instanceof HTMLTextAreaElement)) return
    const { value } = textarea
    editor.onBeforeInput(value)
  }

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.target
    if (!(textarea instanceof HTMLTextAreaElement)) return
    const value = textarea.value
    if (!IS_COMPOSING.get(editor)) {
      textarea.value = ''
    }
    editor.onInput(value)
  }

  const handleCompositionStart = (ev: React.CompositionEvent) => {
    const { data } = ev.nativeEvent
    editor.onCompositionStart(data)
  }

  const handleCompositionEnd = (ev: React.CompositionEvent) => {
    const textarea = ev.target
    if (!(textarea instanceof HTMLTextAreaElement)) return
    const value = textarea.value
    textarea.value = ''
    editor.onCompositionEnd(value)
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const { nativeEvent } = event
    editor.onPaste(nativeEvent)
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

  return (
    <ShadowRect
      rect={Object.assign({}, rect, { color: 'transparent', width: 1 })}
      style={{ opacity: 0, outline: 'none', caretColor: 'transparent', overflow: 'hidden' }}
    >
      <textarea
        ref={current => {
          if (current) {
            EDITOR_TO_INPUT.set(editor, current)
          } else EDITOR_TO_INPUT.delete(editor)
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
          resize: 'vertical',
        }}
        autoFocus={true}
        onKeyDown={handleKeydown}
        onKeyUp={handleKeyup}
        onBeforeInput={handleBeforeInput}
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onPaste={handlePaste}
      />
    </ShadowRect>
  )
}

export { InputComponent }
