import { Editor } from '@editablejs/models'
import { MentionStore } from './store'
import { getMentionTriggerData, clearMentionTriggerData } from './weak-map'

export const closeMentionDecorate = (editor: Editor) => {
  MentionStore.setOpen(editor, false)
  const triggerData = getMentionTriggerData(editor)
  if (triggerData) {
    triggerData.rangeRef.unref()
    triggerData.startRef.unref()
    MentionStore.setSearchValue(editor, '')
  }
  clearMentionTriggerData(editor)
}
