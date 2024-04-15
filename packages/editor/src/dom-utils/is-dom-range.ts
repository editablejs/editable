export type DOMRange = globalThis.Range

export const isDOMRange = (value: unknown): value is DOMRange => {
  return value instanceof globalThis.Range
}
