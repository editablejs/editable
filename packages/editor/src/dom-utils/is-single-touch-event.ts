export const isSingleTouchEvent = (event: unknown): event is Touch => {
  return typeof window.Touch !== 'undefined' && event instanceof Touch
}
