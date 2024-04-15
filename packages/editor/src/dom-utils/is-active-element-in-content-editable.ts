import { isContentEditable } from "./is-content-editable"

export const isActiveElementInContentEditable = () => {
  const activeElement = globalThis.document.activeElement
  if (!activeElement) return false
  if (isContentEditable(activeElement)) return true
  return false
}
