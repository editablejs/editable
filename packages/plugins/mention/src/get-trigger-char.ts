import { Editable } from '@editablejs/editor'
import { MENTION_TRIGGER_KEY } from './constants'
import { getOptions } from './options'

export const getTriggerChar = (editor: Editable): string => {
  return getOptions(editor).triggerChar ?? MENTION_TRIGGER_KEY
}
