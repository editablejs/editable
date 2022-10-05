import { Range, Selection } from 'slate'
import { FC, useMemo, useState } from 'react'
import { Editable } from '../plugin/editable'
import { EDITOR_TO_INPUT, IS_COMPOSING, IS_MOUSEDOWN } from '../utils/weak-maps'
import { useFocused } from '../hooks/use-focused'
import { ShadowRect } from './shadow'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { useEditableStatic } from '../hooks/use-editable-static'
import { useDrawSelection } from '../hooks/use-draw-selection'

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

    if (Editable.isComposing(editor)) {
      return
    }
    editor.onKeydown(nativeEvent)
  }

  const handleKeyup = (event: React.KeyboardEvent) => {
    editor.onKeyup(event.nativeEvent)
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
    editor.onBeforeInput(textarea.value)
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
    editor.onCompositionStart(ev.nativeEvent.data)
  }

  const handleCompositionEnd = (ev: React.CompositionEvent) => {
    const textarea = ev.target
    if (!(textarea instanceof HTMLTextAreaElement)) return
    const value = textarea.value
    textarea.value = ''
    editor.onCompositionEnd(value)
  }

  const { selection, rects } = useDrawSelection()

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
          if (current) EDITOR_TO_INPUT.set(editor, current)
          else EDITOR_TO_INPUT.delete(editor)
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
        onKeyDown={handleKeydown}
        onKeyUp={handleKeyup}
        onBeforeInput={handleBeforeInput}
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onPaste={e => editor.onPaste(e.nativeEvent)}
      />
    </ShadowRect>
  )
}

export { InputComponent }
