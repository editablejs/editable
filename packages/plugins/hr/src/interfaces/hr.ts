import { Element } from '@editablejs/editor'

export type HrStyle = 'dashed' | 'solid' | 'dotted' | 'double'

export interface Hr extends Element {
  type: 'hr'
  width?: number
  color?: string
  style?: HrStyle
}

export const Hr = {
  isHr: (value: any): value is Hr => {
    return Element.isElement(value) && value.type === 'hr'
  },
}
