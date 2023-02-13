export const composeEventHandlers = <E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) => {
  return function handleEvent(event: E) {
    originalEventHandler?.(event)

    if (checkForDefaultPrevented === false || !(event as unknown as Event).defaultPrevented) {
      return ourEventHandler?.(event)
    }
  }
}

export const isTouchEvent = (event: any): event is TouchEvent => {
  return typeof window.TouchEvent !== 'undefined' && event instanceof TouchEvent
}

export const isTouch = (event: any): event is Touch => {
  return typeof window.Touch !== 'undefined' && event instanceof Touch
}

export const isMouseEvent = (event: any): event is MouseEvent => {
  return event instanceof MouseEvent
}

export const getNativeEvent = (event: any) => {
  const { nativeEvent } = event
  event = nativeEvent ?? event
  if (isTouchEvent(event)) {
    return event.touches[0] || event.changedTouches[0]
  }
  return event
}
