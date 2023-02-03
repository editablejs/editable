import { TextOperation } from '@editablejs/models'
import { OpMapper } from '../types'
import { insertText } from './insert-text'
import { removeText } from './remove-text'

export const TEXT_MAPPER: OpMapper<TextOperation> = {
  insert_text: insertText,
  remove_text: removeText,
}
