import { Editor } from '@editablejs/models'
import { MENTION_TRIGGER_KEY } from './constants'
import { getOptions } from './options'

export const getTriggerChar = (editor: Editor): string => {
  return getOptions(editor).triggerChar ?? MENTION_TRIGGER_KEY
}
