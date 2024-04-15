
export const isMultiTouchEvent = (event: Event): event is TouchEvent => {
  return typeof window.TouchEvent !== 'undefined' && event instanceof TouchEvent
}
