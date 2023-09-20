import { Editor, Point, Range } from "@editablejs/models"

const eventListenersMap = new WeakMap<object, (() => void)[]>()

export const detachEventListeners = (o: object) => {
  const listeners = eventListenersMap.get(o)
  if (listeners) {
    listeners.forEach(listener => listener())
  }
}

export const attachEventListeners = (o: object, ...listenersToAdd: (() => void)[]) => {
  const existingListeners = eventListenersMap.get(o) || []
  existingListeners.push(...listenersToAdd)
  eventListenersMap.set(o, existingListeners)
}


export const isPointInSelection = (
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
          !!Editor.above(editor, { match: n => Editor.isVoid(editor, n) })))) ||
    (compareOnCollapsed &&
      Range.isCollapsed(selection) &&
      Point.equals(Range.start(selection), point))
  )
}
