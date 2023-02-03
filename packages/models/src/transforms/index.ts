import { Transforms } from 'slate'
import { _delete } from './delete'
import { insertFragment } from './insert-fragment'
import { insertNodes } from './insert-nodes'
import { insertText } from './insert-text'
import { move } from './move'

Transforms.move = move
Transforms.delete = _delete
Transforms.insertText = insertText
Transforms.insertNodes = insertNodes
Transforms.insertFragment = insertFragment
export { Transforms }
export type { InsertFragmentOptions } from './insert-fragment'
