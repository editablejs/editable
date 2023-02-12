/**
 * Check if an event is overrided by a handler.
 */

import * as React from 'react'

export const isEventHandled = <EventType extends React.SyntheticEvent<unknown, unknown>>(
  event: EventType,
  handler?: (event: EventType) => void | boolean,
) => {
  if (!handler) {
    return false
  }
  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event)

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled
  }

  return event.isDefaultPrevented() || event.isPropagationStopped()
}

/**
 * Check if a DOM event is overrided by a handler.
 */

export const isDOMEventHandled = <E extends Event>(
  event: E,
  handler?: (event: E) => void | boolean,
) => {
  if (!handler) {
    return false
  }

  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event)

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled
  }

  return event.defaultPrevented
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
