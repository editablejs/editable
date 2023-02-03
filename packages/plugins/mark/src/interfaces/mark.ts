import { Text } from '@editablejs/models'

export type MarkFormat = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'sub' | 'sup'

export interface Mark extends Text {
  bold?: string | boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  sup?: boolean
  sub?: boolean
}

export const Mark = {
  isMark: (value: any): value is Mark => {
    if (!Text.isText(value)) return false
    const mark = value as Mark
    return (
      (mark.bold ||
        mark.italic ||
        mark.underline ||
        mark.strikethrough ||
        mark.code ||
        mark.sub ||
        mark.sup) !== undefined
    )
  },
}
