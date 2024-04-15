import { CompositionText } from '../interfaces/composition-text'
import { EditorInterface } from '../interfaces/editor'
import { Text } from '../interfaces/text'

export const isEmpty: EditorInterface['isEmpty'] = (editor, node) => {
  if (Text.isText(node)) return node.text === '' && !CompositionText.isCompositionText(node)
  const { children } = node
  if (children.length === 0) return true
  else if (children.length === 1) {
    return !editor.isVoid(node) && isEmpty(editor, children[0])
  }
  return false
}
