/**
 * Check if a coordinate is between the left and right boundaries of a rectangle.
 * @param x The x-coordinate.
 * @param rect The rectangle.
 * @returns Whether the coordinate is between the left and right boundaries.
 */
export const isBetweenXAxis = (x: number, rect: DOMRect): boolean => {
  return x >= rect.left && x <= rect.right;
};
