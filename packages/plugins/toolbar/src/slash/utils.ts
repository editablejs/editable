import { Editor } from '@editablejs/models'
import { SlashToolbar } from './store'
import { getSlashTriggerData, clearSlashTriggerData } from './weak-map'

export const closeSlashDecorate = (editor: Editor) => {
  SlashToolbar.setOpen(editor, false)
  const triggerData = getSlashTriggerData(editor)
  if (triggerData) {
    triggerData.rangeRef.unref()
    triggerData.startRef.unref()
    SlashToolbar.setSearchValue(editor, '')
  }
  clearSlashTriggerData(editor)
}
