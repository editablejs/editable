import { Range, Point, Transforms, Selection, Editor, Element, Path, Drag, BlockDrag } from "@/interfaces"
import { EDITOR_TO_ELEMENT, IS_FOCUSED, IS_MOUSEDOWN, IS_SHIFT_PRESSED, IS_TOUCHING, IS_TOUCHMOVING, IS_TOUCH_HOLD } from "@/utils/weak-maps";

import { APPLICATION_FRAGMENT_TYPE } from "@/utils/constants";
import { isActiveElementInContentEditable, isContentEditable, isContextMenuEvent, isDOMNode, isInPositionedElement, isMouseEvent, isTouchDevice, parseFragmentFromString, retrieveMainEvent, setDataToDataTransfer } from "@/dom-utils";
import { isDoubleClick, isDoubleClickWithinThreshold, setDoubleClick } from "./multiple-click";
import { focusEditorTextarea } from "@/layout";

const EDITOR_TO_START_POINT = new WeakMap<Editor, Point | null>()
export const getSelectionStartPoint = (editor: Editor) => {
  return EDITOR_TO_START_POINT.get(editor)
}

export const setSelectionStartPoint = (editor: Editor, point: Point | null) => {
  EDITOR_TO_START_POINT.set(editor, point)
}


const EDITOR_TO_CONTEXT_MENU = new WeakMap<Editor, boolean>()

export const setContextMenuFromEditor = (editor: Editor, value: boolean) => {
  EDITOR_TO_CONTEXT_MENU.set(editor, value)
}

export const isContextMenuFromEditor = (editor: Editor) => {
  return EDITOR_TO_CONTEXT_MENU.get(editor) || false
}

const EDITOR_TO_DRAG_END = new WeakMap<Editor, boolean>()

const isPointInSelection = (
  editor: Editor,
  selection: Range,
  point: Point,
  compareOnCollapsed = false,
) => {
  return (
    (Range.includes(selection, point) &&
      ((!Point.equals(Range.end(selection), point) &&
        !Point.equals(Range.start(selection), point)) ||
        (Range.isCollapsed(selection) &&
          !!Editor.above(editor, { match: n => Element.isElement(n) && Editor.isVoid(editor, n) })))) ||
    (compareOnCollapsed &&
      Range.isCollapsed(selection) &&
      Point.equals(Range.start(selection), point))
  )
}

export const handleSelectionStart = (editor: Editor, e: MouseEvent | TouchEvent) => {
  const event = retrieveMainEvent(e)
  if (e.defaultPrevented && isMouseEvent(event) && event.button !== 2) return
  const contentEditable = EDITOR_TO_ELEMENT.get(editor)
  const targetNode = event.target
  if (
    !event.target ||
    (isDOMNode(targetNode) && !contentEditable?.contains(targetNode)) ||
    isContentEditable(targetNode) ||
    isInPositionedElement(targetNode)
  )
    return

  IS_MOUSEDOWN.set(editor, true)
  if (isDoubleClick(editor)) {
    const isWithinThreshold = isDoubleClickWithinThreshold(editor, event)
    if (!isWithinThreshold) {
      setDoubleClick(editor, false)
    }
  }

  focusEditorTextarea(editor)

  const point = Editor.getEditorPointFromDOMEvent(editor, event)
  if (!point) {
    setSelectionStartPoint(editor, null)
    return
  }
  const isShift = IS_SHIFT_PRESSED.get(editor)

  const { selection } = editor
  if (!isShift) {
    if (isContextMenuEvent(event)) {
      setContextMenuFromEditor(editor, true)
    }
    // Perform drag on existing selection while selected.
    else if (
      selection &&
      isPointInSelection(editor, selection, point, isTouchDevice)
    ) {
      // Drag not performed on touch devices.
      if (!isTouchDevice) {
        const dataTransfer = new DataTransfer()
        setDataToDataTransfer(dataTransfer, {
          fragment: editor.getFragment(selection),
        })
        Drag.setCurrentDrag(editor, {
          source: selection,
          dataTransfer: dataTransfer,
          mousePosition: {
            x: event.clientX,
            y: event.clientY,
          },
        })
        editor.onSelectStart()
      }
      return
    }
    setSelectionStartPoint(editor, point)
  }
  if (isContextMenuFromEditor(editor) && selection && Range.includes(selection, point)) {
    // 右键点击选中的内容，不做任何操作
    // do nothing
    return
  }
  if (handleSelectionInProgress(editor, point)) editor.onSelectStart()
}

export const handleSelectionInProgress = (editor: Editor, point: Point) => {
  const { selection } = editor;

  let anchorPoint: Point | null | undefined = null;

  if (IS_TOUCHING.get(editor)) {
    anchorPoint = point;
  } else {
    anchorPoint = IS_SHIFT_PRESSED.get(editor) && selection ? selection.anchor : getSelectionStartPoint(editor);
  }

  if (!anchorPoint) return null;

  const newSelection: Selection = { anchor: anchorPoint, focus: point };

  if (selection && Range.equals(newSelection, selection)) {
    return selection;
  }

  Transforms.select(editor, newSelection);
  return newSelection
}

const getDragBlockPath = (editor: Editor, drag: BlockDrag) => {
  const { destination, mousePosition } = drag
  if (!destination || !mousePosition) return
  const entry = Editor.above(editor, {
    at: Path.isPath(destination) ? destination : destination.focus,
    match: n => Element.isElement(n),
    mode: 'lowest',
  })
  if (!entry) return
  const element = Editor.getDOMNode(editor, entry[0])
  const rect = element.getBoundingClientRect()
  const { y, height } = rect
  const { y: pY } = mousePosition
  if (pY > y + height / 2) {
    return Path.next(entry[1])
  } else {
    return entry[1]
  }
}

export const handleSelectionEnd = (editor: Editor, event: MouseEvent | TouchEvent) => {
  const currentDrag = Drag.getCurrentDrag(editor)
  const isMouseDown = IS_MOUSEDOWN.get(editor)
  if (
    currentDrag ||
    (IS_TOUCHING.get(editor) && !IS_TOUCH_HOLD.get(editor)) ||
    (isMouseDown &&
      (!event.defaultPrevented || (event instanceof MouseEvent && event.button === 2)))
  ) {
    if (editor.isFocused() && !isContentEditable(event.target) && !isActiveElementInContentEditable()) {
      focusEditorTextarea(editor)
    }
    const point = Editor.getEditorPointFromDOMEvent(editor, event)
    let isPointWithinSelection = false
    if (point && currentDrag) {
      const { source, dataTransfer } = currentDrag
      const fromRange = Editor.range(editor, source)
      if (!Range.includes(fromRange, point)) {
        const fragment = parseFragmentFromString(dataTransfer.getData(APPLICATION_FRAGMENT_TYPE))
        if (Drag.isBlockDrag(currentDrag)) {
          const path = getDragBlockPath(editor, currentDrag)
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
            Transforms.removeNodes(editor, { at: source })
            const at = rangeRef.unref()
            Transforms.insertNodes(editor, fragment, {
              at: at?.anchor.path ?? path,
              select: true,
            })
          }
        } else {
          const deleteAfterRange = Editor.rangeRef(editor, Editor.range(editor, point))
          Transforms.delete(editor, {
            at: source,
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
      } else if (isContextMenuFromEditor(editor) && selection && Range.includes(selection, point)) {
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
    Drag.setCurrentDrag(editor, null)
    if (!EDITOR_TO_DRAG_END.get(editor) && (!IS_TOUCHING.get(editor) || !isPointWithinSelection))
      editor.onSelectEnd()
  }
  setContextMenuFromEditor(editor, false)
  setSelectionStartPoint(editor, null)
  IS_TOUCHMOVING.set(editor, false)
  IS_TOUCHING.set(editor, false)
  IS_MOUSEDOWN.set(editor, false)
}
