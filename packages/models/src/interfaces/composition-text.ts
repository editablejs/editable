import { BaseText, Text } from 'slate'

interface Composition extends BaseText {
  offset: number
  isEmpty?: boolean
}

export interface CompositionText extends Text {
  composition: Composition
}

export const CompositionText = {
  isCompositionText: (value: any): value is CompositionText => {
    return typeof value.composition === 'object' && Text.isText(value)
  },
}
