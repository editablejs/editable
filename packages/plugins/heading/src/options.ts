import { Editable } from '@editablejs/editor'
import {
  HEADING_ONE_KEY,
  HEADING_TWO_KEY,
  HEADING_THREE_KEY,
  HEADING_FOUR_KEY,
  HEADING_FIVE_KEY,
  HEADING_SIX_KEY,
} from './constants'
import { HeadingFontStyleName, HeadingTextMark, HeadingType } from './types'

export type Hotkeys = Record<HeadingType, string | ((e: KeyboardEvent) => boolean)>

export interface HeadingOptions {
  enabled?: HeadingType[]
  disabled?: HeadingType[]
  hotkeys?: Hotkeys
  style?: Partial<Record<HeadingType, Record<HeadingFontStyleName, string>>>
  // 标题样式应用到text中的哪个属性
  textMark?: Partial<HeadingTextMark>
}
const HEADING_OPTIONS = new WeakMap<Editable, HeadingOptions>()

export const getOptions = (editor: Editable): HeadingOptions => {
  return HEADING_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: HeadingOptions) => {
  HEADING_OPTIONS.set(editor, options)
}

const defaultStyle = {
  [HEADING_ONE_KEY]: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  [HEADING_TWO_KEY]: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  [HEADING_THREE_KEY]: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  [HEADING_FOUR_KEY]: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  [HEADING_FIVE_KEY]: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  [HEADING_SIX_KEY]: {
    fontSize: '12px',
    fontWeight: 'bold',
  },
}

export const getStyle = (
  editor: Editable,
  type: HeadingType,
): Record<HeadingFontStyleName, string> => {
  const { style = defaultStyle } = getOptions(editor)
  return style[type] ?? defaultStyle[type]
}

const defaultTextMark: HeadingTextMark = {
  fontSize: 'fontSize',
  fontWeight: 'bold',
}

export const getTextMark = (editor: Editable): HeadingTextMark => {
  const { textMark = defaultTextMark } = getOptions(editor)
  return Object.assign(defaultTextMark, textMark)
}
