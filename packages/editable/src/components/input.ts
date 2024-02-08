import { BaseSelection, Range } from "@editablejs/models";
import { Editable } from "../plugin/editable";
import { Focused, FocusedStore } from "../plugin/focused";
import { Readonly } from "../plugin/readonly";
import { SelectionDrawing, SelectionDrawingStore } from "../plugin/selection-drawing";
import { ShadowBlockProps, createShadowBlock } from "./shadow";
import { ComponentState, CreateFunctionComponent, append, createComponent, createComponentRef, detach, setAttr, setAttributes, withComponentStore } from "@editablejs/dom-utils";
import { EDITOR_TO_INPUT, IS_COMPOSING, IS_MOUSEDOWN, IS_PASTE_TEXT, IS_TOUCHING } from "../utils/weak-maps";
import { composeEventHandlers } from "../utils/event";


type UpdateInputState = {
  focused: boolean
  selection: BaseSelection
}

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
export interface CreateInputOptions extends ComponentState {
  editor: Editable
}

export const createInput: CreateFunctionComponent<CreateInputOptions> = ({ editor }) => {

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

  const textarea = createComponent('textarea', {
    mount() {

      EDITOR_TO_INPUT.set(editor, this)

      setAttributes(this, {
        rows: 1,
        style: 'font-size:inherit;line-height:1px;padding:0;white-space:nowrap;width:1em;overflow:auto;resize:vertical;',
      })

      const unsubscribe = Readonly.subscribe(editor, (readonly) => {
        this.readOnly = readonly
      })

      this.createEvent('keydown', () => handleKeydown, [])
      this.createEvent('keyup', () => handleKeyup, [])
      this.createEvent('beforeinput', () => handleBeforeInput, [])
      this.createEvent('input', () => handleInput, [])
      this.createEvent('compositionstart', () => handleCompositionStart, [])
      this.createEvent('compositionend', () => handleCompositionEnd, [])
      this.createEvent('blur', () => handleBlur, [])
      this.createEvent('focus', () => handleFocus, [])
      this.createEvent('paste', () => handlePaste, [])

      return () => {
        unsubscribe()
      }
    },
  })

  const block = createShadowBlock({
    position: {
      top: 0,
      left: 0,
    },
    size: {
      width: 1,
      height: 0,
    },
    children: textarea,
  })

  setAttr(block, 'style', `opacity:0;outline:none;caret-color:transparent;overflow:hidden;`)

  withComponentStore<ShadowBlockProps, FocusedStore & SelectionDrawingStore>(block, ({ focused, selection }) => {
    const rect = getSelectionRect(editor, {
      focused,
      selection
    })
    return {
      position: {
        top: rect ? rect.top : 0,
        left: rect ? rect.left : 0,
      },
      size: {
        width: rect ? rect.width : 1,
        height: rect ? rect.height : 0,
      }
    }
  }, [Focused.getStore(editor), SelectionDrawing.getStore(editor)])

  return block
}
