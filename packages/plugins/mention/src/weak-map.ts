import { Editable, PointRef, RangeRef, Text } from '@editablejs/editor'

interface MentionTriggerData {
  startRef: PointRef
  rangeRef: RangeRef
  text: Text
}

const MENTION_TRIGGER_DATA_WEAK_MAP = new WeakMap<Editable, MentionTriggerData>()

export const getMentionTriggerData = (editor: Editable): MentionTriggerData | undefined => {
  return MENTION_TRIGGER_DATA_WEAK_MAP.get(editor)
}

export const setMentionTriggerData = (editor: Editable, data: MentionTriggerData) => {
  MENTION_TRIGGER_DATA_WEAK_MAP.set(editor, data)
}

export const clearMentionTriggerData = (editor: Editable) => {
  MENTION_TRIGGER_DATA_WEAK_MAP.delete(editor)
}
