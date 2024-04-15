/**
 * Check if a given DOMRect intersects with a given line defined by its top, bottom, and height values
 * @param {DOMRect} rect - The DOMRect to check
 * @param {Object} line - An object with top, bottom, and height properties representing the line
 * @return {Boolean} - True if the rect intersects with the line, false otherwise
 */
export const isRectInLine = (rect: DOMRect, line: Record<'top' | 'bottom' | 'height', number>) => {
  const deltaEdge = rect.height / 3
  return (
    // Check if the rect is fully contained within the line
    (rect.top >= line.top &&
      (rect.bottom <= line.bottom ||
        // Check if the top of the rect is in the line and the overflow of the bottom is within 2/3
        rect.top + deltaEdge < line.bottom ||
        // Check if the bottom of the rect is within 2/3 from the top of the line and the top of the rect is above the bottom of the line
        (rect.top <= line.top + line.height / 3 && rect.bottom > line.top))) ||
    // Check if the rect covers the height of the line and the line is within the top and bottom of the rect
    (rect.top <= line.top &&
      (rect.bottom >= line.bottom ||
        // Check if the top of the rect is above or equal to the top of the line and the bottom of the rect is within 2/3 of the line
        rect.bottom - deltaEdge > line.top)) ||
    // Check if the bottom of the rect is within 2/3 from the bottom of the line and the top of the rect is above the bottom of the line
    (rect.bottom <= line.bottom &&
      rect.bottom >= line.bottom - line.height / 3 &&
      rect.top < line.bottom)
  )
}
