import { BaseSelection, Editor, Focused, Range, Readonly } from "@/interfaces";
import { createShadowBlockComponent } from "./shadow";
import { EDITOR_TO_INPUT, IS_COMPOSING, IS_MOUSEDOWN, IS_PASTE_TEXT, IS_TOUCHING } from "../utils/weak-maps";
import { append, composeEventHandlers, createElement, listen, setAttribute, setAttributes } from "@/dom-utils";
import { attachEvent } from "./event";

type UpdateInputState = {
  focused: boolean
  selection: BaseSelection
}

const getSelectionRect = (editor: Editor, state: UpdateInputState) => {
  const { focused, selection } = state
  const rects = selection ? Editor.getLineRectsFromRange(editor, selection) : []
  let rect: DOMRect | null = null
  if (selection && focused && rects.length > 0) {
    if (Range.isCollapsed(selection))
      rect = rects[0]
    else {
      rect = rects[rects.length - 1]
      rect = new DOMRect(rect.left + rect.width, rect.top, rect.width, rect.height)
    }
  }
  return rect
}

export const createInputComponent = (editor: Editor, container: HTMLElement | ShadowRoot) => {

  const handleKeydown = (event: KeyboardEvent) => {
    if (Editor.isComposing(editor) && event.isComposing === false) {
      IS_COMPOSING.set(editor, false)
    }

    if (event.defaultPrevented || Editor.isComposing(editor)) {
      return
    }
    editor.onKeydown(event)
  }

  const handleKeyup = (event: KeyboardEvent) => {
    editor.onKeyup(event)
  }

  const handleBlur = () => {
    if (!IS_MOUSEDOWN.get(editor) && !IS_TOUCHING.get(editor)) Focused.setFocused(editor, false)
  }

  const handleFocus = () => {
    Focused.setFocused(editor, true)
  }

  const handleBeforeInput = (event: InputEvent) => {
    const textarea = event.target
    if (!(textarea instanceof HTMLTextAreaElement)) return
    const { value } = textarea
    editor.onBeforeInput(value)
  }

  const handleInput = (event: Event) => {
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
        if (Readonly.isReadonly(editor)) {
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

  const textarea = createElement('textarea')
  setAttributes(textarea, {
    rows: 1,
    style: {
      fontSize: 'inherit',
      lineHeight: '1px',
      padding: '0',
      whiteSpace: 'nowrap',
      width: '1em',
      overflow: 'auto',
      resize: 'vertical',
    },
  })
  EDITOR_TO_INPUT.set(editor, textarea)

  const { onReadonly, onDrawingSelectionChange, onFocus, onBlur } = editor
  editor.onReadonly = (readonly) => {
    textarea.readOnly = readonly
    onReadonly(readonly)
  }

  attachEvent(editor, listen(textarea, 'keydown', handleKeydown),
    listen(textarea, 'keyup', handleKeyup),
    listen(textarea, 'beforeinput', handleBeforeInput),
    listen(textarea, 'input', handleInput),
    listen(textarea, 'compositionstart', handleCompositionStart),
    listen(textarea, 'compositionend', handleCompositionEnd),
    listen(textarea, 'blur', handleBlur),
    listen(textarea, 'focus', handleFocus),
    listen(textarea, 'paste', handlePaste))


  const block = createShadowBlockComponent({
    position: {
      top: 0,
      left: 0,
    },
    size: {
      width: 1,
      height: 0,
    }
  })
  const { container: blockElement } = block
  append(container, block.container)
  setAttribute(blockElement, 'style', `opacity:0;outline:none;caret-color:transparent;overflow:hidden;`)

  append(block.container, textarea)
  const update = () => {
    const rect = getSelectionRect(editor, {
      focused: Focused.isFocused(editor),
      selection: editor.selection
    })
    block.update({
      position: {
        top: rect ? rect.top : 0,
        left: rect ? rect.left : 0,
      },
      size: {
        width: rect ? rect.width : 1,
        height: rect ? rect.height : 0,
      }
    })
  }

  editor.onDrawingSelectionChange = (drawingSelection) => {
    update()
    onDrawingSelectionChange(drawingSelection)
  }

  editor.onFocus = () => {
    update()
    onFocus()
  }

  editor.onBlur = () => {
    update()
    onBlur()
  }

  return {
    update,
  }
}
