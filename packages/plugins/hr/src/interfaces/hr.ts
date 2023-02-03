import { Element } from '@editablejs/models'
import { HR_KEY } from '../constants'

export type HrStyle = 'dashed' | 'solid' | 'dotted' | 'double'

export interface Hr extends Element {
  type: typeof HR_KEY
  width?: number
  color?: string
  style?: HrStyle
}

export const Hr = {
  isHr: (value: any): value is Hr => {
    return Element.isElement(value) && value.type === 'hr'
  },

  create: (hr: Omit<Hr, 'type' | 'children'> = {}): Hr => {
    return {
      ...hr,
      type: HR_KEY,
      children: [{ text: '' }],
    }
  },
}
