import { isMouseEvent } from "./is-mouse-event"

export const isContextMenuEvent = (event: unknown): event is MouseEvent => {
  return isMouseEvent(event) && event.button === 2
}
