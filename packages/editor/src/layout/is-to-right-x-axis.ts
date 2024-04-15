/**
 * Check if a node is positioned to the right in the X-axis.
 * @param rect The rectangle of the current node.
 * @param node The current node.
 * @param otherRect The rectangle of the other node.
 * @param otherNode The other node to compare with.
 * @returns Whether the current node is positioned to the right in the X-axis.
 */
export const isToRightXAxis = (rect: DOMRect, node: Node, otherRect: DOMRect, otherNode: Node): boolean => {
  return (
    rect.left < otherRect.left ||
    (rect.left === otherRect.left &&
      node.compareDocumentPosition(otherNode) === Node.DOCUMENT_POSITION_FOLLOWING)
  );
};
