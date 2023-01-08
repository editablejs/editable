import { Editable, Path, Range, Element } from '@editablejs/editor'

interface CapturedData {
  selection: Range
  path: Path
  element: Element
  isEmpty: boolean
}

const SIDETOOLBAR_CAPTURED_DATA_WEAK_MAP = new WeakMap<Editable, CapturedData>()

export const getCapturedData = (editor: Editable): CapturedData | undefined => {
  return SIDETOOLBAR_CAPTURED_DATA_WEAK_MAP.get(editor)
}

export const setCapturedData = (editor: Editable, data: CapturedData) => {
  SIDETOOLBAR_CAPTURED_DATA_WEAK_MAP.set(editor, data)
}

export const clearCapturedData = (editor: Editable) => {
  SIDETOOLBAR_CAPTURED_DATA_WEAK_MAP.delete(editor)
}
