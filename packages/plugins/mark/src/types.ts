import { Text } from '@editablejs/editor'

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
