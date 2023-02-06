import { Element, generateRandomKey } from '@editablejs/models'
import { CODEBLOCK_KEY } from '../constants'

export interface CodeBlockTheme {
  backgroundColor: string
  color: string
}

export interface CodeBlock extends Element {
  id: string
  type: typeof CODEBLOCK_KEY
  code: string
  language?: string
  tabSize?: number
  lineWrapping?: boolean
  theme?: 'light' | 'dark'
}

export const CodeBlock = {
  isCodeBlock: (value: any): value is CodeBlock => {
    return Element.isElement(value) && value.type === CODEBLOCK_KEY
  },

  create: (options: Partial<Omit<CodeBlock, 'type' | 'children'>> = {}): CodeBlock => {
    return {
      lineWrapping: false,
      theme: 'light',
      tabSize: 2,
      ...options,
      language: options.language || 'plain',
      id: generateRandomKey(),
      type: CODEBLOCK_KEY,
      code: options.code ?? '',
      children: [{ text: '' }],
    }
  },
}
