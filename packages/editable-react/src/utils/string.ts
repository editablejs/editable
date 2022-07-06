import { nextBreak, previousBreak } from "@editablejs/editable-breaker";

/**
 * @zh-CN 获取字符串索引处的向前或向后字符
 * @param text 文本
 * @param offset 索引
 * @param backward 是否取向后的字符，默认 false
 * @returns 字符串索引处的上或下个字符
 */
export const getCharFromGraphemeBreaker = (text: string, offset: number, backward = false) => {
  if (offset < 0 || offset > text.length) {
    return "";
  }
  let value;
  if (backward) {
    value = previousBreak(text, offset);
    return text.substring(value, offset);
  } else {
    value = nextBreak(text, offset);
    return text.substring(offset, value);
  }
};

/**
 * 获取字符串索引处的向后的字符索引
 * @param text 文本
 * @param offset 索引
 * @returns 向后的字符索引
 */
export const getCharOffsetBackward = (text: string, offset: number) => {
  return getCharFromGraphemeBreaker(text, offset, true).length || 1;
};

/**
 * 获取字符串索引处的向前的字符索引
 * @param text 文本
 * @param offset 索引
 * @returns 向前的字符索引
 */
export const getCharOffsetForward = (text: string, offset: number) => {
  return getCharFromGraphemeBreaker(text, offset).length || 1;
};

/**
 * 字形断路器
 * 获取字符串中的字符范围，Unicode字符范围不确定（高代理、低代理、私有代理字符存在）
 * @param text 文本
 * @param offset 当前索引
 * @returns [start, end]
 */
export const getCharRange = (text: string, offset: number) => {
  let i = 0;
  for (; i <= offset; ) {
    const end = i + getCharOffsetForward(text, i);
    if (end > offset) return [i, end];
    i = end;
  }
  return [i, i + Math.min(text.length, 1)];
};

/**
 * @zh-CN 获取在Text节点处鼠标点击坐标时的字符索引
 * @param node Text Node
 * @param x 
 * @param y 
 * @param start 
 * @param end 
 * @param length 
 * @returns 
 * 
 */
export const getOffset = (
  node: Text,
  x: number,
  y: number,
  start: number,
  end: number,
  length: number
): number => {
  const range = document.createRange();
  if (end - start > 1) {
    const mid = Math.floor((start + end) / 2);
    try {
      range.setStart(node, mid);
      range.setEnd(node, Math.max(Math.min(mid, length), 0));
    } catch (e) {
      return start;
    }
    const rect = range.getClientRects().item(0);
    if (!rect) {
      return start;
    }

    if (y < rect.top) {
      return getOffset(node, x, y, start, mid, length);
    } else if (y > rect.bottom) {
      return getOffset(node, x, y, mid, end, length);
    } else if (x <= rect.left + rect.width) {
      return getOffset(node, x, y, start, mid, length);
    }
    return getOffset(node, x, y, mid, end, length);
  }
  const [rStart, rEnd] = getCharRange(node.textContent || "", start);
  try {
    range.setStart(node, rStart);
    range.setEnd(node, Math.max(Math.min(rEnd, length), 0));
  } catch (err) {
    return rStart;
  }
  const rects = Array.from(range.getClientRects());
  const rect = rects.find((r) => r.width > 0) || rects[0];
  if (!rect) {
    return rStart;
  } else if (y < rect.top) {
    return rStart;
  } else if (y > rect.bottom) {
    return rEnd;
  } else if (x <= rect.left + rect.width / 2) {
    return rStart;
  } else {
    return rEnd;
  }
};