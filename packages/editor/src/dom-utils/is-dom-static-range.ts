export type DOMStaticRange = globalThis.StaticRange

export const isDOMStaticRange = (value: unknown): value is DOMStaticRange => {
  return value instanceof globalThis.StaticRange
}
