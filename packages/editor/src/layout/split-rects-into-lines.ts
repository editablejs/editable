import { isRectInLine } from "./is-rect-in-line"

interface LineRectangle {
  top: number
  height: number
  bottom: number
  left: number
  right: number
}

/**
 * Splits the rectangles into lines based on their positions.
 * @param rects
 */
export const splitRectsIntoLines = (rects: DOMRect[] | DOMRectList) => {
  const lines: Map<LineRectangle, DOMRect[]> = new Map()
  if (rects.length === 0) return lines

  const lineKeys: LineRectangle[] = []

  /**
   * Finds the line that the rectangle belongs to.
   * @param rect
   */
  const findLineKey = (rect: DOMRect) => {
    for (const lineKey of lineKeys) {
      const { right } = lineKey
      const previousRects = lines.get(lineKey)
      const lastRect = previousRects
        ? previousRects
          .concat()
          .reverse()
          .find(p => p.width > 0) ?? previousRects[previousRects.length - 1]
        : null
      if (isRectInLine(rect, lineKey) && rect.left <= (lastRect ? lastRect.right : right) + 1) {
        return lineKey
      }
    }
    return null
  }

  // Loop through each rectangle and find its line
  for (let r = 0; r < rects.length; r++) {
    const rect = rects[r]
    const key = findLineKey(rect)
    if (key) {
      lines.get(key)?.push(rect)
    } else {
      const lineRect = {
        top: rect.top,
        height: rect.height,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      }
      lines.set(lineRect, [rect])
      lineKeys.push(lineRect)
    }
  }

  // Find the minimum top, maximum bottom, and maximum right for each line
  for (const [line, rects] of lines) {
    // If there's only one rectangle in the line, skip
    if (rects.length === 1) continue

    let minTop = line.top,
      maxBottom = line.bottom,
      maxRight = line.right

    // Compare each rectangle
    for (const rect of rects) {
      const { top, bottom, right } = rect
      if (top < minTop) minTop = top
      if (bottom > maxBottom) maxBottom = bottom
      if (right > maxRight && rect.width > 0) maxRight = right
    }
    line.top = minTop
    line.bottom = maxBottom
    line.right = maxRight
  }
  return lines
}
