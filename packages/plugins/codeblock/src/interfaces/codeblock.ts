import { ChangeSpec } from '@codemirror/state'
import { Element, generateRandomKey } from '@editablejs/editor'
import { CODEBLOCK_KEY } from '../constants'

export interface CodeBlock extends Element {
  id: string
  type: typeof CODEBLOCK_KEY
  code: string
  language?: string
  tabSize?: number
  changes?: string
}

export const CodeBlock = {
  isCodeBlock: (value: any): value is CodeBlock => {
    return Element.isElement(value) && value.type === CODEBLOCK_KEY
  },

  create: (options: Partial<Omit<CodeBlock, 'type' | 'children'>> = {}): CodeBlock => {
    return {
      ...options,
      id: generateRandomKey(),
      type: CODEBLOCK_KEY,
      code: options.code ?? '',
      children: [{ text: '' }],
    }
  },
}
