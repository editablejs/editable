import { isMultiTouchEvent } from "./is-multi-touch-event"
import { isSingleTouchEvent } from "./is-single-touch-event"

export const retrieveMainEvent = (inputEvent: MouseEvent | TouchEvent | Touch) => {
  if (isSingleTouchEvent(inputEvent)) return inputEvent
  if (isMultiTouchEvent(inputEvent)) {
    return inputEvent.touches[0] || inputEvent.changedTouches[0]
  }
  return inputEvent
}
