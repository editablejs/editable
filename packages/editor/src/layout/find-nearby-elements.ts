import { isBetweenYAxis } from "./is-between-y-axis";
import { isNearbyYAxis } from "./is-nearby-y-axis";
import { isToLeftXAxis } from "./is-to-left-x-axis";
import { isToRightXAxis } from "./is-to-right-x-axis";

type NearbyElement = {
  rect: DOMRect;
  element: Element;
};

type NearbyElements = {
  top: NearbyElement | null;
  bottom: NearbyElement | null;
  left: NearbyElement | null;
  right: NearbyElement | null;
};

/**
 * Find nearby nodes based on coordinates.
 * @param nodes The list of nodes.
 * @param x The x-coordinate.
 * @param y The y-coordinate.
 * @returns The nearby nodes.
 */
export const findNearbyElements = (nodes: Element[], x: number, y: number): Element | NearbyElements | null => {
  const nearbyNodes: NearbyElements = {
    top: null,
    bottom: null,
    left: null,
    right: null,
  };
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const rects = node.getClientRects();
    for (let j = 0; j < rects.length; j++) {
      const rect = rects[j];
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return node;
      } else if (y < rect.top) {
        if (!nearbyNodes.bottom || isNearbyYAxis(x, rect, node, nearbyNodes.bottom.rect, nearbyNodes.bottom.element, false)) {
          nearbyNodes.bottom = {
            rect,
            element: node,
          };
        }
      } else if (y > rect.bottom) {
        if (!nearbyNodes.top || isNearbyYAxis(x, rect, node, nearbyNodes.top.rect, nearbyNodes.top.element)) {
          nearbyNodes.top = {
            rect,
            element: node,
          };
        }
        if (nearbyNodes.left && isToLeftXAxis(rect, node, nearbyNodes.left.rect, nearbyNodes.left.element)) {
          nearbyNodes.left = {
            rect,
            element: node,
          };
        }
      } else if (
        isBetweenYAxis(y, rect) &&
        x > rect.left &&
        (!nearbyNodes.left || isToLeftXAxis(rect, node, nearbyNodes.left.rect, nearbyNodes.left.element))
      ) {
        nearbyNodes.left = {
          rect,
          element: node,
        };
      } else if (
        isBetweenYAxis(y, rect) &&
        x < rect.right &&
        (!nearbyNodes.right || isToRightXAxis(rect, node, nearbyNodes.right.rect, nearbyNodes.right.element))
      ) {
        nearbyNodes.right = {
          rect,
          element: node,
        };
      }
    }
  }
  return nearbyNodes;
};
