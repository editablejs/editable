import { nextBreak, previousBreak } from '@editablejs/breaker'

/**
 * @zh-CN 获取字符串索引处的向前或向后字符
 * @param text 文本
 * @param offset 索引
 * @param backward 是否取向后的字符，默认 false
 * @returns 字符串索引处的上或下个字符
 */
export const getCharFromGraphemeBreaker = (text: string, offset: number, backward = false) => {
  if (offset < 0 || offset > text.length) {
    return ''
  }
  let value
  if (backward) {
    value = previousBreak(text, offset)
    return text.substring(value, offset)
  } else {
    value = nextBreak(text, offset)
    return text.substring(offset, value)
  }
}

/**
 * 获取字符串索引处的向后的字符索引
 * @param text 文本
 * @param offset 索引
 * @returns 向后的字符索引
 */
export const getCharOffsetBackward = (text: string, offset: number) => {
  return getCharFromGraphemeBreaker(text, offset, true).length || 1
}

/**
 * 获取字符串索引处的向前的字符索引
 * @param text 文本
 * @param offset 索引
 * @returns 向前的字符索引
 */
export const getCharOffsetForward = (text: string, offset: number) => {
  return getCharFromGraphemeBreaker(text, offset).length || 1
}

/**
 * 字形断路器
 * 获取字符串中的字符范围，Unicode字符范围不确定（高代理、低代理、私有代理字符存在）
 * @param text 文本
 * @param offset 当前索引
 * @returns [start, end]
 */
export const getCharRange = (text: string, offset: number) => {
  let i = 0
  for (; i <= offset; ) {
    const end = i + getCharOffsetForward(text, i)
    if (end > offset) return [i, end]
    i = end
  }
  return [i, i + Math.min(text.length, 1)]
}

const isSpace = (char: string) => /\s/.test(char)
// http://www.unicode.org/charts/
const isIdeograph = (char: string) =>
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u3131-\uD79D]/.test(char)
// http://www.unicode.org/charts/
// https://zh.wikipedia.org/zh-cn/Unicode%E5%AD%97%E7%AC%A6%E5%88%97%E8%A1%A8
const isSpecialCharacters = (char: string) =>
  /[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E\u00A1-\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65\uFFE5]/.test(
    char,
  )

const equalOfCharacterType = (char: string, other: string) => {
  return (
    !!char &&
    !!other &&
    !isSpace(char) &&
    !isSpecialCharacters(char) &&
    !isSpace(other) &&
    !isSpecialCharacters(other) &&
    isIdeograph(char) === isIdeograph(other)
  )
}

interface Segment {
  segment: string
  index: number
  input: string
  isWordLike: boolean
}

declare global {
  interface Window {
    Intl: {
      Segmenter?: new (
        locale?: string,
        options?: { granularity: 'word' | 'sentence' | 'line' },
      ) => {
        segment: (text: string) => Iterable<Segment>
      }
    }
  }
}

export const splitTextOfWord = (text: string, callback?: (segments: Segment[]) => Segment) => {
  // split word
  const Segmenter = window.Intl.Segmenter
  if (Segmenter && isIdeograph(text)) {
    const segments: Segment[] = Array.from(
      new Segmenter(undefined, { granularity: 'word' }).segment(text),
    )
    if (segments.length > 0) {
      const { segment, index } = callback ? callback(segments) : segments[segments.length - 1]
      return { text: segment, offset: index }
    }
  }
  return { text, offset: 0 }
}

export const getWordBackward = (text: string, offset: number) => {
  let currentChar = getCharFromGraphemeBreaker(text, offset, true)
  let backwardOffset = offset - 1
  for (; backwardOffset >= 0; ) {
    const backwardChar = getCharFromGraphemeBreaker(text, backwardOffset, true)
    if (equalOfCharacterType(currentChar, backwardChar)) {
      backwardOffset -= backwardChar.length
    } else break
  }
  if (offset - backwardOffset > 1) {
    const wordText = text.substring(backwardOffset, offset)
    const { offset: wordOffset } = splitTextOfWord(wordText)
    backwardOffset += wordOffset
  }
  return text.substring(backwardOffset < 0 ? 0 : backwardOffset, offset)
}

export const getWordOffsetBackward = (text: string, offset: number) => {
  return offset - getWordBackward(text, offset).length
}

export const getWordForward = (text: string, offset: number) => {
  let currentChar = getCharFromGraphemeBreaker(text, offset)
  let forwardOffset = offset + 1
  for (; forwardOffset < text.length; ) {
    const forwardChar = getCharFromGraphemeBreaker(text, forwardOffset)
    if (equalOfCharacterType(currentChar, forwardChar)) {
      forwardOffset += forwardChar.length
    } else break
  }
  if (forwardOffset - offset > 1) {
    const newText = text.substring(offset, forwardOffset)
    const { text: wordText, offset: wordOffset } = splitTextOfWord(newText, segments => segments[0])
    forwardOffset = offset + wordOffset + wordText.length
  }
  return text.substring(offset, forwardOffset > text.length ? text.length : forwardOffset)
}

export const getWordOffsetForward = (text: string, offset: number) => {
  return offset + getWordForward(text, offset).length
}

export const getWordRange = (text: string, offset: number) => {
  if (!text) return [0, 0]
  offset = Math.min(offset, text.length)

  let previousChar = getCharFromGraphemeBreaker(text, offset, true)
  let nextChar = getCharFromGraphemeBreaker(text, offset)

  let backwardOffset = offset - 1
  let forwardOffset = offset + 1
  if (!nextChar) {
    return [offset, offset]
  }
  if (previousChar && equalOfCharacterType(previousChar, nextChar)) {
    for (; backwardOffset >= 0; ) {
      const backwardChar = getCharFromGraphemeBreaker(text, backwardOffset, true)
      if (equalOfCharacterType(previousChar, backwardChar)) {
        backwardOffset -= backwardChar.length
      } else break
    }
  } else {
    backwardOffset = offset
  }

  for (; forwardOffset < text.length; ) {
    const forwardChar = getCharFromGraphemeBreaker(text, forwardOffset)
    if (equalOfCharacterType(nextChar, forwardChar)) {
      forwardOffset += forwardChar.length
    } else break
  }
  // split word
  if (forwardOffset - backwardOffset > 1) {
    const newText = text.substring(backwardOffset, forwardOffset)
    const { text: wordText, offset: wordOffset } = splitTextOfWord(newText, segments => {
      for (let i = segments.length - 1; i >= 0; i--) {
        const segment = segments[i]
        const wordStart = segment.index + backwardOffset
        if (offset >= wordStart && offset < wordStart + segment.segment.length) {
          return segment
        }
      }
      return segments[0]
    })
    backwardOffset += wordOffset
    forwardOffset = wordText.length + backwardOffset
  }
  return [backwardOffset, forwardOffset]
}

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
export const getTextOffset = (
  node: Text,
  x: number,
  y: number,
  start: number,
  end: number,
  length: number,
): number => {
  const range = document.createRange()
  if (end - start > 1) {
    const mid = Math.floor((start + end) / 2)
    try {
      range.setStart(node, mid)
      range.setEnd(node, Math.max(Math.min(mid, length), 0))
    } catch (e) {
      return start
    }
    const rects = range.getClientRects()
    if (rects.length === 0) {
      return start
    }
    for (const rect of rects) {
      if (y < rect.top) {
        return getTextOffset(node, x, y, start, mid, length)
      } else if (y > rect.bottom) {
        return getTextOffset(node, x, y, mid, end, length)
      } else if (x <= rect.left + rect.width) {
        return getTextOffset(node, x, y, start, mid, length)
      }
    }
    return getTextOffset(node, x, y, mid, end, length)
  }
  const [rStart, rEnd] = getCharRange(node.textContent || '', start)
  try {
    range.setStart(node, rStart)
    range.setEnd(node, Math.max(Math.min(rEnd, length), 0))
  } catch (err) {
    return rStart
  }
  const rects = range.getClientRects()
  if (rects.length === 0) return rStart

  for (const rect of rects) {
    if (rect.width === 0) continue
    if (y < rect.top) {
      return rStart
    } else if (y > rect.bottom) {
      return rEnd
    } else if (x <= rect.left + rect.width / 2) {
      return rStart
    }
  }
  return rEnd
}
