import { Editor, Range, Element, Ancestor, Descendant } from 'slate'

import ElementComponent from '../components/element'
import TextComponent from '../components/text'
import { EditableEditor } from '..'
import { useSlateStatic } from './use-slate-static'
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../utils/weak-maps'
import { SelectedContext } from './use-selected'

/**
 * Children.
 */

const useChildren = (props: {
  node: Ancestor
  selection: Range | null
}) => {
  const {
    node,
    selection,
  } = props
  const editor = useSlateStatic()
  const path = EditableEditor.findPath(editor, node)
  const children = []
  const isLeafBlock =
    Element.isElement(node) &&
    !editor.isInline(node) &&
    Editor.hasInlines(editor, node)

  for (let i = 0; i < node.children.length; i++) {
    const p = path.concat(i)
    const n = node.children[i] as Descendant
    const key = EditableEditor.findKey(editor, n)
    const range = Editor.range(editor, p)
    const sel = selection && Range.intersection(range, selection)

    if (Element.isElement(n)) {
      children.push(
        <SelectedContext.Provider key={`provider-${key.id}`} value={!!sel}>
          <ElementComponent
            element={n}
            key={key.id}
            selection={sel}
          />
        </SelectedContext.Provider>
      )
    } else {
      children.push(
        <TextComponent
          key={key.id}
          isLast={isLeafBlock && i === node.children.length - 1}
          parent={node}
          text={n}
        />
      )
    }

    NODE_TO_INDEX.set(n, i)
    NODE_TO_PARENT.set(n, node)
  }

  return children
}

export default useChildren
