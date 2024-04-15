import { getDefaultView } from "./get-default-view"

export type DOMSelection = globalThis.Selection

export const isDOMSelection = (value: unknown): value is DOMSelection => {
  if (!value) return false
  const selection = value as DOMSelection
  const window = selection.anchorNode && getDefaultView(selection.anchorNode)
  return !!window && value instanceof (window as any).Selection
}
