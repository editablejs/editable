export const isMouseEvent = (event: unknown): event is MouseEvent => {
  return event instanceof MouseEvent
}
