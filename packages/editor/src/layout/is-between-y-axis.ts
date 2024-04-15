/**
 * Check if a coordinate is between the top and bottom boundaries of a rectangle.
 * @param y The y-coordinate.
 * @param rect The rectangle.
 * @returns Whether the coordinate is between the top and bottom boundaries.
 */
export const isBetweenYAxis = (y: number, rect: DOMRect): boolean => {
  return y >= rect.top && y <= rect.bottom;
};
