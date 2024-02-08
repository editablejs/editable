import { Range } from "@editablejs/models";
import { ComponentState, CreateFunctionComponent, setStyle, withComponentStore } from "@editablejs/dom-utils";
import { Editable } from "../plugin/editable";
import { Focused, FocusedStore } from "../plugin/focused";
import { SelectionDrawing, SelectionDrawingStore } from "../plugin/selection-drawing";
import { ShadowBlockProps, createShadowBlock } from "./shadow";
import { isTouchDevice } from "../utils/environment";
import { ReadonlyStore, Readonly } from "../plugin/readonly";
import { IS_MOUSEDOWN } from "../utils/weak-maps";

export interface CreateSelectionCaretProps extends ComponentState {
  timeout?: number
  editor: Editable
}

export const createSelectionCaret: CreateFunctionComponent<CreateSelectionCaretProps> = ({ editor, timeout = 530 }) => {

  const block = createShadowBlock({
    position: {
      top: 0,
      left: 0,
    },
    size: {
      width: 0,
      height: 0,
    },
    opacity: 0,
  })

  let timeoutId: number | null = null
  const clearCaretTimeout = () => {
    const caretTimeout = timeoutId
    if (caretTimeout) {
      clearTimeout(caretTimeout)
    }
  }

  const setOpacity = (opacity?: number) => {
    block.style.opacity = opacity !== undefined ? String(opacity) : block.style.opacity === '1' ? '0' : '1'
  }

  const animate = (editor: Editable, timeout: number, opacity?: number) => {
    clearCaretTimeout()
    if (IS_MOUSEDOWN.get(editor)) {
      setOpacity(1)
    } else {
      setOpacity(opacity)
    }
    timeoutId = setTimeout(() => {
      animate(editor, timeout)
    }, timeout)
  }

  withComponentStore<ShadowBlockProps, SelectionDrawingStore & FocusedStore & ReadonlyStore>(block, (state) => {
    const { selection, style, focused, enabled, readonly } = state

    clearCaretTimeout()
    if (!enabled || readonly) {
      setStyle(block, 'display', 'none')
      return
    }
    const rects = selection ? SelectionDrawing.toRects(editor, selection) : []
    let rect: DOMRect | null = null
    if (selection && rects.length > 0 && focused && Range.isCollapsed(selection)) {
      rect = rects[0]
    }

    const caretWidth = isTouchDevice ? style.touchWidth : style.caretWidth
    const caretColor = isTouchDevice ? style.touchColor : style.caretColor

    if (rect) animate(editor, timeout, 1)

    return {
      position: {
        top: rect ? rect.top : 0,
        left: rect ? rect.left : 0,
      },
      size: {
        width: caretWidth ?? 0,
        height: rect ? rect.height : 0,
      },
      bgColor: caretColor ?? 'transparent',
      opacity: rect ? 1 : 0,
    }
  }, [SelectionDrawing.getStore(editor), Focused.getStore(editor), Readonly.getStore(editor)])

  return block
}
