export const getDefaultView = (value: unknown): Window | null => {
  if (!(value instanceof globalThis.Node)) return null
  return value.ownerDocument?.defaultView || null
}
