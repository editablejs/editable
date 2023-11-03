import { DOMNode, Range, Point, Transforms, Selection, Editor, Element, Path } from "@editablejs/models";
import { Editable } from "../../../plugin/editable";
import { getPrimaryEvent, isMouseEvent, isTouchEvent } from "../../../utils/event";
import { EDITOR_TO_ELEMENT, IS_MOUSEDOWN, IS_SHIFT_PRESSED, IS_TOUCHING, IS_TOUCHMOVING, IS_TOUCH_HOLD } from "../../../utils/weak-maps";
import { canForceTakeFocus, inAbsoluteDOMElement, isEditableDOMElement } from "../../../utils/dom";
import { Focused } from "../../../plugin/focused";
import { EDITOR_TO_CONTEXT_MENU, EDITOR_TO_DOUBLE_CLICK, EDITOR_TO_DOUBLE_CLICK_WITHIN_THRESHOLD_FUNCTION, EDITOR_TO_DRAG_END, EDITOR_TO_START_POINT } from "./weak-maps";
import { isTouchDevice } from "../../../utils/environment";
import { isPointInSelection } from "./utils";
import { parseFragmentFromString, setDataTransfer } from "../../../utils/data-transfer";
import { Drag } from "../../../plugin/drag";
import { APPLICATION_FRAGMENT_TYPE } from "../../../utils/constants";

export const handleSelectionStart = (editor: Editable, e: MouseEvent | TouchEvent) => {
  const event = getPrimaryEvent(e)
  if (e.defaultPrevented && isMouseEvent(event) && event.button !== 2) return
  const contentEditable = EDITOR_TO_ELEMENT.get(editor)
  if (
    !event.target ||
    !contentEditable?.contains(event.target as DOMNode) ||
    isEditableDOMElement(event.target) ||
    inAbsoluteDOMElement(event.target)
  )
    return

  IS_MOUSEDOWN.set(editor, true)
  if (EDITOR_TO_DOUBLE_CLICK.get(editor)) {
    const isWithinThreshold = EDITOR_TO_DOUBLE_CLICK_WITHIN_THRESHOLD_FUNCTION.get(editor)
    if (!isWithinThreshold || !isWithinThreshold(event)) {
      EDITOR_TO_DOUBLE_CLICK.set(editor, false)
    }
  }

  Focused.setState(editor, true)

  const point = Editable.findEventPoint(editor, event)
  if (!point) {
    EDITOR_TO_START_POINT.set(editor, null)
    return
  }
  const isShift = IS_SHIFT_PRESSED.get(editor)

  const { selection } = editor
  if (!isShift) {
    if (event instanceof MouseEvent && event.button === 2) {
      EDITOR_TO_CONTEXT_MENU.set(editor, true)
    }
    // Perform drag on existing selection while selected.
    else if (
      selection &&
      Focused.getState(editor) &&
      isPointInSelection(editor, selection, point, isTouchDevice)
    ) {
      // Drag not performed on touch devices.
      if (!isTouchDevice) {
        const dataTransfer = new DataTransfer()
        setDataTransfer(dataTransfer, {
          fragment: editor.getFragment(selection),
        })
        Drag.setState(editor, {
          from: selection,
          data: dataTransfer,
          position: {
            x: event.clientX,
            y: event.clientY,
          },
        })
        editor.onSelectStart()
      }
      return
    }
    EDITOR_TO_START_POINT.set(editor, point)
  }
  if (EDITOR_TO_CONTEXT_MENU.get(editor) && selection && Range.includes(selection, point)) {
    // 右键点击选中的内容，不做任何操作
    // do nothing
    return
  }
  if (handleSelectionInProgress(editor, point)) editor.onSelectStart()
}

export const handleSelectionInProgress = (editor: Editable, point: Point) => {
  const { selection } = editor;

  let anchorPoint: Point | null | undefined = null;

  if (IS_TOUCHING.get(editor)) {
    anchorPoint = point;
  } else {
    anchorPoint = IS_SHIFT_PRESSED.get(editor) && selection ? selection.anchor : EDITOR_TO_START_POINT.get(editor);
  }

  if (!anchorPoint) return null;

  const newSelection: Selection = { anchor: anchorPoint, focus: point };

  if (selection && Range.equals(newSelection, selection)) {
    return selection;
  }

  Transforms.select(editor, newSelection);
  return newSelection
}

export const handleSelectionEnd = (editor: Editable, event: MouseEvent | TouchEvent) => {
  const activeDrag = Drag.getState(editor)
  const isMouseDown = IS_MOUSEDOWN.get(editor)
  if (
    activeDrag ||
    (IS_TOUCHING.get(editor) && !IS_TOUCH_HOLD.get(editor)) ||
    (isMouseDown &&
      (!event.defaultPrevented || (event instanceof MouseEvent && event.button === 2)))
  ) {
    if (Focused.getState(editor) && !isEditableDOMElement(event.target) && canForceTakeFocus()) {
      editor.focus()
    }
    const point = Editable.findEventPoint(editor, event)
    let isPointWithinSelection = false
    if (point && activeDrag) {
      const { from, data } = activeDrag
      const fromRange = Editor.range(editor, from)
      if (!Range.includes(fromRange, point)) {
        const fragment = parseFragmentFromString(data.getData(APPLICATION_FRAGMENT_TYPE))
        if (activeDrag.type === 'block') {
          const path = Drag.calculateBlockPath(editor, activeDrag)
          if (path && fragment.length > 0) {
            const rangeRef = Editor.rangeRef(editor, {
              anchor: {
                path,
                offset: 0,
              },
              focus: {
                path,
                offset: 0,
              },
            })
            Transforms.removeNodes(editor, { at: from })
            const at = rangeRef.unref()
            Transforms.insertNodes(editor, fragment, {
              at: at?.anchor.path ?? path,
              select: true,
            })
          }
        } else {
          const deleteAfterRange = Editor.rangeRef(editor, Editor.range(editor, point))
          Transforms.delete(editor, {
            at: from,
            unit: 'line',
            hanging: true,
          })
          const anchorRange = deleteAfterRange.unref()
          Transforms.select(editor, anchorRange ?? point)
          Transforms.insertFragment(editor, fragment)
          const focus = editor.selection?.focus
          if (anchorRange && focus) {
            let anchor = anchorRange.anchor
            const anchorElement = Editor.above(editor, {
              at: anchorRange,
              match: node => Element.isElement(node),
              voids: true,
            })

            const nextPath = Path.next(anchor.path)

            if (anchorElement && Editor.hasPath(editor, nextPath)) {
              const nextRange = Editor.range(editor, nextPath)
              const element = Editor.above(editor, {
                at: nextRange,
                match: node => Element.isElement(node),
                voids: true,
              })
              if (element && anchorElement[0] !== element[0]) {
                anchor = nextRange.anchor
              }
            }
            Transforms.select(editor, {
              anchor,
              focus,
            })
          }
        }
        EDITOR_TO_DRAG_END.set(editor, true)
      } else {
        Transforms.select(editor, point)
      }
    } else if (point) {
      const { selection } = editor
      if (
        IS_TOUCHING.get(editor) &&
        selection &&
        isPointInSelection(editor, selection, point)
      ) {
        isPointWithinSelection = true
      } else if (EDITOR_TO_CONTEXT_MENU.get(editor) && selection && Range.includes(selection, point)) {
        // 右键点击选中的内容，不做任何操作
        // do nothing
      }
      else {
        // 是否选中在同一个位置
        const newSelection = handleSelectionInProgress(editor, point)
        isPointWithinSelection = newSelection === selection
      }
    }
    // 修复 touch 时，触发了 mouse up 事件，导致无法触发 onSelectStart
    if (IS_TOUCHING.get(editor) && !IS_TOUCH_HOLD.get(editor)) {
      // touch 在同一个位置，触发 onTouchTrack
      if (isPointWithinSelection) editor.onTouchTrack()
      else editor.onSelectStart()
    }
    Drag.setState(editor, null)
    if (!EDITOR_TO_DRAG_END.get(editor) && (!IS_TOUCHING.get(editor) || !isPointWithinSelection))
      editor.onSelectEnd()
  }
  EDITOR_TO_CONTEXT_MENU.set(editor, false)
  EDITOR_TO_START_POINT.set(editor, null)
  IS_TOUCHMOVING.set(editor, false)
  IS_TOUCHING.set(editor, false)
  IS_MOUSEDOWN.set(editor, false)
}
