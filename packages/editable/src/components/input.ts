import { BaseSelection, Range } from "@editablejs/models";
import { Editable } from "../plugin/editable";
import { Focused } from "../plugin/focused";
import { Readonly } from "../plugin/readonly";
import { SelectionDrawing } from "../plugin/selection-drawing";
import { createShadowBlock } from "./shadow";
import { append, detach, element, listen, setAttributes } from "@editablejs/dom-utils";
import { EDITOR_TO_INPUT, IS_COMPOSING, IS_MOUSEDOWN, IS_PASTE_TEXT, IS_TOUCHING } from "../utils/weak-maps";
import { composeEventHandlers } from "../utils/event";

export interface CreateInputOptions {
  container: HTMLElement | ShadowRoot
}

export const createInput = (editor: Editable, options: CreateInputOptions) => {

  const readonlyStore = Readonly.getStore(editor)
  const focusedStore = Focused.getStore(editor)
  const selectionStore = SelectionDrawing.getStore(editor)

  const getState = () => {
    return {
      readonly: Readonly.getState(editor),
      focused: Focused.getState(editor),
      selection: selectionStore.getState().selection
    }
  }

  const readonlyUnsubscribe = readonlyStore.subscribe(() => {
    updateInputState(editor, getState())
  })

  const focusedUnsubscribe = focusedStore.subscribe(() => {
    updateInputState(editor, getState())
  })

  createInputComponent(editor, options)
  updateInputState(editor, getState())

  return () => {
    readonlyUnsubscribe()
    focusedUnsubscribe()
    detachInputComponent(editor)
  }
}

type UpdateInputState = {
  readonly: boolean,
  focused: boolean
  selection: BaseSelection
}

const EDITOR_TO_BLOCK_WEAK_MAP = new WeakMap<Editable, HTMLElement>()

const getSelectionRect = (editor: Editable, state: UpdateInputState) => {
  const { focused, selection } = state
  const rects = selection ? SelectionDrawing.toRects(editor, selection) : []
  let rect: DOMRect | null = null
  if (selection && focused && rects.length > 0) {
    if(Range.isCollapsed(selection))
      rect = rects[0]
    else {
      rect = rects[rects.length - 1]
      rect = new DOMRect(rect.left + rect.width, rect.top, rect.width, rect.height)
    }
  }
  return rect
}

const updateInputState = (editor: Editable, state: UpdateInputState) => {
  const rect = getSelectionRect(editor, state)
  const textarea = EDITOR_TO_INPUT.get(editor)
  const block = EDITOR_TO_BLOCK_WEAK_MAP.get(editor)
  if(!textarea || !block) return
  textarea.readOnly = state.readonly
  block.style.top = rect ? `${rect.top}px` : '0px'
  block.style.left = rect ? `${rect.left}px` : '0px'
  block.style.height = rect ? `${rect.height}px` : '0px'
}

const detachInputComponent = (editor: Editable) => {
  const textarea = EDITOR_TO_INPUT.get(editor)
  if(textarea) {
    detach(textarea)
  }

  const block = EDITOR_TO_BLOCK_WEAK_MAP.get(editor)
  if(block) {
    detach(block)
  }
}

const createInputComponent = (editor: Editable, options: CreateInputOptions) => {

  detachInputComponent(editor)

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
    if (!IS_MOUSEDOWN.get(editor) && !IS_TOUCHING.get(editor)) Focused.setState(editor, false)
  }

  const handleFocus = () => {
    Focused.setState(editor, true)
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
        if (Readonly.getState(editor)) {
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


  const block = createShadowBlock({
    position: {
      top: 0,
      left: 0,
    },
    size: {
      width: 1,
      height: 0,
    },
    style: `opacity:0;outline:none;caret-color:transparent;overflow:hidden;`
  })
  const textarea = element('textarea')
  setAttributes(textarea, {
    rows: 1,
    style: 'font-size:inherit;line-height:1px;padding:0;white-space:nowrap;width:1em;overflow:auto;resize:vertical;',
  })
  listen(textarea, 'keydown', handleKeydown)
  listen(textarea, 'keyup', handleKeyup)
  listen(textarea, 'beforeinput', handleBeforeInput)
  listen(textarea, 'input', handleInput)
  listen(textarea, 'compositionstart', handleCompositionStart)
  listen(textarea, 'compositionend', handleCompositionEnd)
  listen(textarea, 'blur', handleBlur)
  listen(textarea, 'focus', handleFocus)
  listen(textarea, 'paste', handlePaste)

  append(block, textarea)

  EDITOR_TO_INPUT.set(editor, textarea)
  EDITOR_TO_BLOCK_WEAK_MAP.set(editor, block)

  append(options.container, block)
}
