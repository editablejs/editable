/**
 * Check if two nodes are vertically aligned.
 * @param rect The rectangle of the current node.
 * @param otherRect The rectangle of the other node.
 * @param scale The scale to determine alignment.
 * @returns Whether the two nodes are vertically aligned.
 */
export const isVerticallyAligned = (rect: DOMRect, otherRect: DOMRect, scale = 0.4): boolean => {
  if (rect.bottom === otherRect.bottom) return true;
  if (rect.top > otherRect.bottom || otherRect.top > rect.bottom) return false;
  const minHeight = Math.min(otherRect.height, rect.height);
  const innerHeight = Math.min(rect.bottom, otherRect.bottom) - Math.max(rect.top, otherRect.top);
  return minHeight === 0 || innerHeight / minHeight > scale;
};
