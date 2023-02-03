import { Editor, PointRef, RangeRef, Text } from '@editablejs/models'

interface MentionTriggerData {
  startRef: PointRef
  rangeRef: RangeRef
  text: Text
}

const MENTION_TRIGGER_DATA_WEAK_MAP = new WeakMap<Editor, MentionTriggerData>()

export const getMentionTriggerData = (editor: Editor): MentionTriggerData | undefined => {
  return MENTION_TRIGGER_DATA_WEAK_MAP.get(editor)
}

export const setMentionTriggerData = (editor: Editor, data: MentionTriggerData) => {
  MENTION_TRIGGER_DATA_WEAK_MAP.set(editor, data)
}

export const clearMentionTriggerData = (editor: Editor) => {
  MENTION_TRIGGER_DATA_WEAK_MAP.delete(editor)
}
