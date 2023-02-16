import { Editor, PointRef, RangeRef, Text } from '@editablejs/models'

interface SlashTriggerData {
  startRef: PointRef
  rangeRef: RangeRef
  text: Text
}

const SLASH_TRIGGER_DATA_WEAK_MAP = new WeakMap<Editor, SlashTriggerData>()

export const getSlashTriggerData = (editor: Editor): SlashTriggerData | undefined => {
  return SLASH_TRIGGER_DATA_WEAK_MAP.get(editor)
}

export const setSlashTriggerData = (editor: Editor, data: SlashTriggerData) => {
  SLASH_TRIGGER_DATA_WEAK_MAP.set(editor, data)
}

export const clearSlashTriggerData = (editor: Editor) => {
  SLASH_TRIGGER_DATA_WEAK_MAP.delete(editor)
}
