import { isDOMHTMLElement } from "./is-dom-html-element"

export const clearDOMSelection = () => {
  const selection = document.getSelection()
  if (!selection?.rangeCount) {
    return function () { }
  }
  let activeElement: HTMLElement | null = null
  let active = document.activeElement
  if (active && active.shadowRoot) {
    active = active.shadowRoot.activeElement
  }
  if (isDOMHTMLElement(active)) {
    activeElement = active
  }
  const ranges: Range[] = []
  for (var i = 0; i < selection.rangeCount; i++) {
    ranges.push(selection.getRangeAt(i))
  }
  switch (
  activeElement?.tagName.toUpperCase() // .toUpperCase handles XHTML
  ) {
    case 'INPUT':
    case 'TEXTAREA':
      activeElement.blur()
      break

    default:
      activeElement = null
      break
  }

  selection.removeAllRanges()
  return () => {
    if (selection.type === 'Caret') {
      selection.removeAllRanges()
    }

    if (!selection.rangeCount) {
      ranges.forEach(range => {
        selection.addRange(range)
      })
    }
    if (activeElement) {
      activeElement.focus()
    }
  }
}
