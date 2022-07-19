
interface ClosestNode {
  node: Element
  rect: DOMRect
}

/**
 * 是否在一个节点前面
 * @param rect 
 * @param node 
 * @param otherNode 
 * @returns 
 */
export const isPrecedingY = (rect: DOMRect, node: Node, other: ClosestNode) => {
  return rect.bottom > other.rect.bottom || (rect.top === other.rect.bottom && node.compareDocumentPosition(other.node) === Node.DOCUMENT_POSITION_PRECEDING)
}

export const isFollowingY = (rect: DOMRect, node: Node, other: ClosestNode) => { 
  return rect.top < other.rect.top || (rect.top === other.rect.top && node.compareDocumentPosition(other.node) === Node.DOCUMENT_POSITION_FOLLOWING)
}

export const isPrecedingX = (rect: DOMRect, node: Node, other: ClosestNode) => {
  return rect.right > other.rect.right || (rect.right === other.rect.right && node.compareDocumentPosition(other.node) === Node.DOCUMENT_POSITION_PRECEDING)
}

export const isFollowingX = (rect: DOMRect, node: Node, other: ClosestNode) => {
  return rect.left < other.rect.left || (rect.left === other.rect.left && node.compareDocumentPosition(other.node) === Node.DOCUMENT_POSITION_FOLLOWING)
}

/**
 * 是否垂直对齐
 * @param rect 
 * @param other 
 * @param scale 
 * @returns 
 */
export const isAlignY = (rect: DOMRect, other: DOMRect, scale = 0.4) => {
  if (rect.bottom === other.bottom)
    return true;
  // 未在水平上
  if (rect.top > other.bottom || other.top > rect.bottom)
    return false;
  const minHeight = Math.min(other.height, rect.height)
  const innerHeight = Math.min(rect.bottom, other.bottom) - Math.max(rect.top, other.top);
  // 超过多少比例在水平上
  return 0 === minHeight || innerHeight / minHeight > scale
}

/**
 * 判断 x 在 rect 中是否处于 left 与 right 之间
 * @param x 
 * @param rect 
 * @returns 
 */
export const isBetweenX = (x: number, rect: DOMRect) => { 
  return x >= rect.left && x <= rect.right
}

/**
 * 判断 y 在 rect 中是否处于 top 与 bottom 之间
 * @param y 
 * @param rect 
 * @returns 
 */
export const isBetweenY = (y: number, rect: DOMRect) => { 
  return y >= rect.top && y <= rect.bottom
}

/**
 * 获取 x 在 rect 中 left 与 right 之间最小的距离
 * @param x 
 * @param rect 
 * @returns 
 */
export const getMinXInRect = (x: number, rect: DOMRect) => {
  return Math.min(Math.abs(x - rect.left), Math.abs(x - rect.right))
}

export const isClosestY = (x: number, rect: DOMRect, node: Node, closestNode: ClosestNode, preceding = true) => {
  if (isAlignY(rect, closestNode.rect)) {
    const topBetween = isBetweenX(x, closestNode.rect)
    const isBetween = isBetweenX(x, rect)
    const topMin = getMinXInRect(x, closestNode.rect)
    const min = getMinXInRect(x, rect)
    if(!topBetween && (isBetween || min < topMin)) {
      return true
    }
  } else  {
    return preceding ? isPrecedingY(rect, node, closestNode) : isFollowingY(rect, node, closestNode)
  }
}

type ClosestNodes = {
  top: ClosestNode | null
  below: ClosestNode | null
  left: ClosestNode | null
  right: ClosestNode | null
}

const findClosestNode = (nodes: Element[], x: number, y: number): Element | ClosestNodes | null => {
  const closerNode: ClosestNodes = {
    top: null,
    below: null,
    left: null,
    right: null
  }
  for(let i = 0; i < nodes.length; i++) {
    const child = nodes[i]
    const rects = child.getClientRects()
    for( let r = 0; r < rects.length; r++) {
      const rect = rects[r]
      // 刚好在区域内
      if(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return child
      }
      // 点击位置在区域 top上方
      else if (y < rect.top) {
        if (!closerNode.below || isClosestY(x, rect, child, closerNode.below, false)) {
          closerNode.below = {
            rect,
            node: child
          }
        }
      } 
      // 点击区域在 bottom 上方
      else if(y > rect.bottom) {
        if (!closerNode.top || isClosestY(x, rect, child, closerNode.top)) {
          closerNode.top = {
            rect,
            node: child
          }
        }
        if(closerNode.left && isPrecedingX(rect, child, closerNode.left)) {
          closerNode.left = {
            rect,
            node: child
          }
        }
      } else if(isBetweenY(y, rect) && x > rect.left && (!closerNode.left || isPrecedingX(rect, child, closerNode.left))) {
        closerNode.left = {
          rect,
          node: child
        }
      } else if(isBetweenY(y, rect) && x < rect.right && (!closerNode.right || isFollowingX(rect, child, closerNode.right))) {
        closerNode.right = {
          rect,
          node: child
        }
      }
    }
  }
  return closerNode
}

export default findClosestNode