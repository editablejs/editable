import { DOMElement, isDOMElement } from "@/dom-utils"
import { Editor, Element } from "@/interfaces"
import { DATA_EDITABLE_COMPOSITION, DATA_EDITABLE_NODE, DATA_EDITABLE_STRING, DATA_EDITABLE_ZERO_WIDTH } from "../utils/constants"
import { isRectInLine } from "./is-rect-in-line"


/**
 * Calculates the height of a node based on line height and font size
 * @param el The DOM element to calculate height for
 * @returns The calculated height
 */
const calculateElementHeight = (el: DOMElement) => {
  const { lineHeight, fontSize } = window.getComputedStyle(el)

  // TODO: Handle pt, em, rem units

  let height = 0
  // Ends with px
  if (lineHeight.endsWith('px')) {
    height = parseFloat(lineHeight)
    return height
  }
  // Ends with %
  else if (lineHeight.endsWith('%')) {
    height = parseInt(lineHeight, 10) / 100
  }
  // Number
  else if (/^\d+(\.\d+)?$/.test(lineHeight)) {
    height = parseFloat(lineHeight)
  } else {
    return el.getBoundingClientRect().height
  }

  let size = 0
  if (fontSize.endsWith('px')) {
    size = parseInt(fontSize, 10)
  }

  return height * size
}

/**
 * Resets the DOMRect of an element to the specified height
 * @param rect The DOMRect to reset
 * @param height The new height for the rect
 * @returns The reset DOMRect
 */
const resetElementRect = (rect: DOMRect, height: number) => {
  const oldHeight = rect.height
  if (oldHeight >= height) return rect
  const top = rect.top + (oldHeight - height) / 2
  return new DOMRect(rect.left, top, rect.width, height)
}
/**
 * Find the maximum position in the line of the top position in the element node
 * @param editor - The Editor instance
 * @param element - The DOM element
 * @param top - The top position
 * @param bottom - The bottom position
 * @returns - Object containing the line rectangle information
 */
export const findMaxLineRect = (editor: Editor, element: DOMElement, top: number, bottom: number) => {
  const lineRect = {
    top,
    height: bottom - top,
    bottom,
  }

  /**
   * Compare the height of the current rectangle with the line rectangle
   * and update the line rectangle with the highest values
   * @param rect - The current rectangle
   */
  const updateLineRectHeight = (rect: DOMRect) => {
    if (isRectInLine(rect, lineRect)) {
      const newTop = lineRect.top < rect.top ? lineRect.top : rect.top
      const newBottom = lineRect.bottom > rect.bottom ? lineRect.bottom : rect.bottom
      lineRect.height = newBottom - newTop
      lineRect.top = newTop
      lineRect.bottom = newBottom
    }
  }

  /**
   * Recursively find the child nodes of the element and compare their rectangles
   * @param element - The DOM element
   */
  const findLineRectangles = (element: DOMElement) => {
    for (const child of element.childNodes) {
      if (isDOMElement(child)) {
        const hasNodeAttribute = child.hasAttribute(DATA_EDITABLE_NODE)
        const node = hasNodeAttribute ? Editor.getEditorNode(editor, child) : null
        if (node) {
          if (Element.isElement(node)) {
            if (editor.isVoid(node)) {
              const rect = resetElementRect(
                child.getBoundingClientRect(),
                calculateElementHeight(child),
              )
              updateLineRectHeight(rect)
            } else if (editor.isInline(node)) {
              const height = calculateElementHeight(child)
              const rects = child.getClientRects()
              for (let r = 0; r < rects.length; r++) {
                const rect = resetElementRect(rects[r], height)
                updateLineRectHeight(rect)
              }
            } else {
              findLineRectangles(child)
            }
          } else {
            const nodes = child.querySelectorAll(
              `[${DATA_EDITABLE_STRING}], [${DATA_EDITABLE_COMPOSITION}], [${DATA_EDITABLE_ZERO_WIDTH}]`,
            )
            nodes.forEach(node => {
              const height = calculateElementHeight(node)
              const rects = node.getClientRects()
              for (let r = 0; r < rects.length; r++) {
                const rect = resetElementRect(rects[r], height)
                updateLineRectHeight(rect)
              }
            })
          }
        } else {
          findLineRectangles(child)
        }
      }
    }
  }

  findLineRectangles(element)
  return lineRect
}
