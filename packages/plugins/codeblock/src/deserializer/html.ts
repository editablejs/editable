import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { isDOMHTMLElement } from '@editablejs/models'
import {
  CODEBLOCK_DATA_LINE_WRAPPING,
  CODEBLOCK_DATA_SYNTAX,
  CODEBLOCK_DATA_TABSIZE,
  CODEBLOCK_DATA_THEME,
  CODEBLOCK_LANGUAGE,
} from '../constants'
import { CodeBlock } from '../interfaces/codeblock'

const isPreElement = (node: HTMLElement) => {
  return node.nodeName === 'PRE'
}

const findSyntax = (node: HTMLElement) => {
  const classList = node.classList
  for (let i = 0; i < classList.length; i++) {
    const className = classList.item(i)
    if (className && className.startsWith(`${CODEBLOCK_LANGUAGE}-`)) {
      const classArray = className.split('-')
      classArray.shift()
      return classArray.join('-')
    }
  }
  return null
}

export const withCodeBlockHTMLDeserializerTransform: HTMLDeserializerWithTransform = next => {
  return (node, options = {}) => {
    const { element } = options
    if (isDOMHTMLElement(node)) {
      const isPre = isPreElement(node)
      if (!isPre || !node.hasAttribute(CODEBLOCK_DATA_SYNTAX)) return next(node, options)

      let syntax = node.getAttribute(CODEBLOCK_DATA_SYNTAX)
      if (!syntax) {
        if (isPre) {
          syntax = node.getAttribute(CODEBLOCK_LANGUAGE)
          if (!syntax) {
            syntax = findSyntax(node)
          }
        }
        const codeElement = node.querySelector('code')
        if (!syntax && codeElement) {
          syntax =
            codeElement.getAttribute(CODEBLOCK_DATA_SYNTAX) ||
            codeElement.getAttribute(CODEBLOCK_LANGUAGE)
          if (!syntax) {
            syntax = findSyntax(codeElement)
          }
        }
      }
      const tabSize = node.getAttribute(CODEBLOCK_DATA_TABSIZE)
      let theme = node.getAttribute(CODEBLOCK_DATA_THEME)
      if (!theme || ~['dark', 'light'].indexOf(theme)) {
        theme = 'light'
      }
      const lineWrapping = node.getAttribute(CODEBLOCK_DATA_LINE_WRAPPING)
      const codeText = node.innerText.replace(/\u200b/g, '')
      const codeblock = CodeBlock.create({
        ...element,
        language: syntax ?? undefined,
        code: codeText,
        tabSize: tabSize ? parseInt(tabSize, 10) : undefined,
        theme: theme as 'light' | 'dark',
        lineWrapping: lineWrapping === 'true',
      })
      return [codeblock]
    }
    return next(node, options)
  }
}
