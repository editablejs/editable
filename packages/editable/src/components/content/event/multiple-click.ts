import { isDOMNode, Range } from "@editablejs/models";
import { listen } from "@editablejs/dom-utils";
import { Editable } from "../../../plugin/editable";
import { createMultipleClickHandler } from "../../../utils/multiple-click";
import { attachEventListeners } from "./utils";
import { EDITOR_TO_DOUBLE_CLICK, EDITOR_TO_DOUBLE_CLICK_WITHIN_THRESHOLD_FUNCTION } from "./weak-maps";

const DOUBLE_CLICK_THRESHOLD = 500

export const createMultipleClickEvent = (editor: Editable, container: HTMLElement) => {

  let doublueClickTimer: number | null = null

  const { handleMultipleClick, isWithinThreshold } = createMultipleClickHandler({
    onClick: () => {
      EDITOR_TO_DOUBLE_CLICK.set(editor, false)
    },

    onMultipleClick: (event, count) => {
      const { selection } = editor
      if (!selection || event.defaultPrevented) return
      event.preventDefault()
      const container = Editable.toDOMNode(editor, editor)
      if (isDOMNode(event.target) && !container.contains(event.target)) return
      const isCollapsed = Range.isCollapsed(selection)
      if (count === 1 && !isCollapsed) {
        return false
      } else if (count === 2) {
        editor.selectWord()
        EDITOR_TO_DOUBLE_CLICK.set(editor, true)
        if (doublueClickTimer) clearTimeout(doublueClickTimer)
        doublueClickTimer = setTimeout(() => {
         EDITOR_TO_DOUBLE_CLICK.set(editor, false)
        }, DOUBLE_CLICK_THRESHOLD)
        return
      } else if (count === 3) {
        editor.selectLine()
        EDITOR_TO_DOUBLE_CLICK.set(editor, false)
        return false
      }
    },
  })
  EDITOR_TO_DOUBLE_CLICK_WITHIN_THRESHOLD_FUNCTION.set(editor, isWithinThreshold)
  attachEventListeners(editor, listen(container, 'click', handleMultipleClick))
}
