import escapeHtml from 'escape-html'
import { HTMLSerializerWithOptions, HTMLSerializerWithTransform } from '@editablejs/serializer/html'
import { Editor } from '@editablejs/models'

import { CodeBlock } from '../interfaces/codeblock'
import { defaultHighlightStyle, Language } from '@codemirror/language'
import { Highlighter, highlightTree } from '@lezer/highlight'
import { getOptions } from '../options'
import { oneDarkHighlightStyle, colors as darkColors } from '../themes/one-dark'
import { colors as lightColors } from '../themes/base-light'
import {
  CODEBLOCK_DATA_LINE_WRAPPING,
  CODEBLOCK_DATA_SYNTAX,
  CODEBLOCK_DATA_TABSIZE,
  CODEBLOCK_DATA_THEME,
} from '../constants'

export function runmode(
  textContent: string,
  language: Language,
  highlighter: Highlighter,
  callback: (text: string, style: string, from: number, to: number) => void,
  options?: Record<string, any>,
) {
  const tree = language.parser.parse(textContent)
  let pos = 0
  highlightTree(tree, highlighter, (from, to, classes) => {
    from > pos && callback(textContent.slice(pos, from), '', pos, from)

    callback(textContent.slice(from, to), classes, from, to)
    pos = to
  })
  pos != tree.length && callback(textContent.slice(pos, tree.length), '', pos, tree.length)
}
export interface CodeBlockHTMLSerializerWithOptions extends HTMLSerializerWithOptions {
  editor: Editor
}
export const withCodeBlockHTMLSerializerTransform: HTMLSerializerWithTransform<
  CodeBlockHTMLSerializerWithOptions
> = (next, serializer, customOptions) => {
  const { attributes: customAttributes, style: customStyle, editor } = customOptions
  return (node, options) => {
    const { attributes, style } = options ?? {}
    if (CodeBlock.isCodeBlock(node)) {
      const { languages } = getOptions(editor)
      const { language, code, theme = 'light', lineWrapping, tabSize = 2 } = node
      const highlightStyle = theme === 'dark' ? oneDarkHighlightStyle : defaultHighlightStyle
      const styleMap = new Map<string, string>()
      // @ts-ignore
      const rules = highlightStyle.module?.['rules'] ?? []
      for (const rule of rules) {
        const matchArray = (rule as string).match(/^\.(.*?)\s\{(.*?)\}$/)
        if (matchArray && matchArray.length > 2) {
          styleMap.set(matchArray[1], matchArray[2])
        }
      }

      const l = languages?.find(l => l.value === language)
      let html = ''
      if (l?.plugin) {
        runmode(code, l.plugin.language, highlightStyle, (text, style) => {
          const content = escapeHtml(text)
          if (style && styleMap.has(style)) {
            html += `<span style="${styleMap.get(style)}">${content}</span>`
          } else {
            html += content
          }
        })
      } else {
        html = code
      }
      html = html.replace(/\n/g, '<br />')
      return serializer.create(
        'pre',
        serializer.mergeOptions(
          node,
          attributes,
          {
            [CODEBLOCK_DATA_LINE_WRAPPING]: lineWrapping,
            [CODEBLOCK_DATA_SYNTAX]: language,
            [CODEBLOCK_DATA_TABSIZE]: tabSize,
            [CODEBLOCK_DATA_THEME]: theme,
          },
          customAttributes,
        ),
        serializer.mergeOptions(
          node,
          style,
          {
            fontFamily:
              '"Source Code Pro", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            backgroundColor: theme === 'dark' ? darkColors.background : lightColors.background,
            color: lightColors.color,
            borderRadius: '4px',
            border: '1px solid rgb(229 231 235 / 1)',
            padding: '4px 8px',
          },
          customStyle,
        ),
        html,
      )
    }
    return next(node, options)
  }
}
