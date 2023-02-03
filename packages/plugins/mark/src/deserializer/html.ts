import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { isDOMHTMLElement } from '@editablejs/models'
import { Mark } from '../interfaces/mark'

export const withMarkHTMLDeserializerTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { element, text } = options
    if (isDOMHTMLElement(node)) {
      const { style } = node
      const mark: Omit<Mark, 'text'> = { ...text }
      if (node.nodeName === 'STRONG') {
        mark.bold = true
      } else if (!mark.bold) {
        const weight = style.fontWeight || ''
        if (/^\d+$/.test(weight) && parseInt(weight, 10) >= 500) {
          mark.bold = true
        } else if (/bold/i.test(weight)) {
          mark.bold = true
        }
      }

      if (node.nodeName === 'EM' || node.nodeName === 'I' || style.fontStyle === 'italic') {
        mark.italic = true
      }
      if (
        node.nodeName === 'U' ||
        node.nodeName === 'INS' ||
        style.textDecoration === 'underline'
      ) {
        mark.underline = true
      }
      if (node.nodeName === 'S' || style.textDecoration === 'line-through') {
        mark.strikethrough = true
      }
      if (node.nodeName === 'CODE' || style.fontFamily === 'monospace') {
        mark.code = true
      }
      if (node.nodeName === 'SUB' || style.verticalAlign === 'sub') {
        mark.sub = true
      }
      if (node.nodeName === 'SUP' || style.verticalAlign === 'super') {
        mark.sup = true
      }
      return next(node, { element, text: mark })
    }
    return next(node, options)
  }
}
