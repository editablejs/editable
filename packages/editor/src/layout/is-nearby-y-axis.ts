import { isAboveYAxis } from "./is-above-y-axis";
import { isBelowYAxis } from "./is-below-y-axis";
import { isBetweenXAxis } from "./is-between-x-axis";
import { isVerticallyAligned } from "./is-vertically-aligned";

/**
 * Get the minimum distance between a coordinate and the left and right boundaries of a rectangle.
 * @param x The x-coordinate.
 * @param rect The rectangle.
 * @returns The minimum distance between the coordinate and the left and right boundaries.
 */
const getMinDistanceXAxis = (x: number, rect: DOMRect): number => {
  return Math.min(Math.abs(x - rect.left), Math.abs(x - rect.right));
};

/**
 * Check if a node is nearby in the Y-axis.
 * @param x The x-coordinate.
 * @param rect The rectangle of the current node.
 * @param node The current node.
 * @param nearbyNode The nearby node to compare with.
 * @param preceding Whether to check if the current node is preceding.
 * @returns Whether the current node is nearby in the Y-axis.
 */
export const isNearbyYAxis = (
  x: number,
  rect: DOMRect,
  node: Node,
  nearbyRect: DOMRect,
  nearbyNode: Node,
  preceding = true
): boolean => {
  if (isVerticallyAligned(rect, nearbyRect)) {
    const isBetweenTop = isBetweenXAxis(x, nearbyRect);
    const isBetween = isBetweenXAxis(x, rect);
    const minDistanceTop = getMinDistanceXAxis(x, nearbyRect);
    const minDistance = getMinDistanceXAxis(x, rect);
    if (!isBetweenTop && (isBetween || minDistance < minDistanceTop)) {
      return true;
    }
    return false;
  } else if (preceding) {
    return isAboveYAxis(rect, node, nearbyRect, nearbyNode);
  } else {
    return isBelowYAxis(rect, node, nearbyRect, nearbyNode);
  }
};
