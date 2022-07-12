

/**
 * Check if an event is overrided by a handler.
 */

export const isEventHandled = <EventType extends React.SyntheticEvent<unknown, unknown>>(
 event: EventType,
 handler?: (event: EventType) => void | boolean
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
 handler?: (event: E) => void | boolean
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