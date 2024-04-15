/**
 * Check if a node is positioned below in the Y-axis.
 * @param rect The rectangle of the current node.
 * @param node The current node.
 * @param otherRect The rectangle of the other node.
 * @param otherNode The other node to compare with.
 * @returns Whether the current node is positioned below in the Y-axis.
 */
export const isBelowYAxis = (rect: DOMRect, node: Node, otherRect: DOMRect, otherNode: Node): boolean => {
  return (
    rect.top < otherRect.top ||
    (rect.top === otherRect.top &&
      node.compareDocumentPosition(otherNode) === Node.DOCUMENT_POSITION_FOLLOWING)
  );
};
