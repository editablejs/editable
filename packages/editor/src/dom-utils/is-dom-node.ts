import { getDefaultView } from "./get-default-view"

export type DOMNode = globalThis.Node
export const isDOMNode = (value: unknown): value is DOMNode => {
  const window = getDefaultView(value) ?? globalThis.window
  return !!window && value instanceof (window as any).Node
}
