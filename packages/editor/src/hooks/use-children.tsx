import { Editor, Range, Element, Ancestor, Descendant } from '@editablejs/models'

import ElementComponent from '../components/element'
import TextComponent from '../components/text'
import { Editable } from '../plugin/editable'
import { useEditableStatic } from './use-editable'
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../utils/weak-maps'
import { NodeSelectedContext } from './use-node-selected'
import { NodeFocusedContext } from './use-node-focused'
import { GridContext } from './use-grid'
import { PlaceholderRender } from '../plugin/placeholder'

/**
 * Children.
 */
const useChildren = (props: {
  node: Ancestor
  selection: Range | null
  renderPlaceholder?: PlaceholderRender
}) => {
  const { node, selection, renderPlaceholder } = props
  const editor = useEditableStatic()
  const path = Editable.findPath(editor, node)
  const children = []
  const isLeafBlock =
    Element.isElement(node) && !editor.isInline(node) && Editor.hasInlines(editor, node)

  for (let i = 0; i < node.children.length; i++) {
    const p = path.concat(i)
    const n = node.children[i] as Descendant
    const key = Editable.findKey(editor, n)
    const range = Editor.range(editor, p)
    const sel = selection && Range.intersection(range, selection)
    const focused =
      selection && Range.includes(range, selection.anchor) && Range.includes(range, selection.focus)

    if (Element.isElement(n)) {
      const element = (
        <NodeSelectedContext.Provider key={`selected-provider-${key.id}`} value={!!sel}>
          <NodeFocusedContext.Provider key={`focused-provider-${key.id}`} value={focused ?? false}>
            <ElementComponent
              element={n}
              key={key.id}
              selection={sel}
              renderPlaceholder={renderPlaceholder}
            />
          </NodeFocusedContext.Provider>
        </NodeSelectedContext.Provider>
      )
      if (Editor.isGrid(editor, n)) {
        children.push(
          <GridContext.Provider key={`grid-provider-${key.id}`} value={n}>
            {element}
          </GridContext.Provider>,
        )
      } else {
        children.push(element)
      }
    } else {
      children.push(
        <TextComponent
          renderPlaceholder={renderPlaceholder}
          key={key.id}
          isLast={isLeafBlock && i === node.children.length - 1}
          parent={node}
          text={n}
        />,
      )
    }

    NODE_TO_INDEX.set(n, i)
    NODE_TO_PARENT.set(n, node)
  }

  return children
}

export default useChildren
