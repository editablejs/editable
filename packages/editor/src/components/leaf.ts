import { Element, Text } from '@editablejs/models'
import String from './string'
import { useEditableStatic } from '../hooks/use-editable'
import { TextAttributes } from '../plugin/editable'
import { DATA_EDITABLE_LEAF, DATA_EDITABLE_PLACEHOLDER } from '../utils/constants'
import { PlaceholderRender } from '../plugin/placeholder'
import { html, c } from 'rezon'

interface LeafProps {
  isLast: boolean
  parent: Element
  leaf: Text
  text: Text
  renderPlaceholder?: PlaceholderRender
}
/**
 * Individual leaves in a text node with unique formatting.
 */
const Leaf = c<LeafProps>(
  props => {
    const { isLast, text, leaf, parent, renderPlaceholder } = props

    let children = String({
      isLast,
      parent,
      text,
      leaf,
    })

    const editor = useEditableStatic()
    if (renderPlaceholder) {
      const placeholderComponent = editor.renderPlaceholder({
        attributes: { [DATA_EDITABLE_PLACEHOLDER]: true },
        node: text,
        children: renderPlaceholder({ node: text }),
      })
      if (placeholderComponent) children = [html`${placeholderComponent}`, html`${children}`]
    }

    // COMPAT: Having the `data-` attributes on these leaf elements ensures that
    // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
    // contenteditable behaviors. (2019/05/08)
    const attributes: TextAttributes = {
      [DATA_EDITABLE_LEAF]: true,
    }
    const newAttributes = editor.renderLeafAttributes({ attributes, text })
    return editor.renderLeaf({ attributes: newAttributes, children, text })
  },
  (prev, next) => {
    return (
      next.parent === prev.parent &&
      prev.renderPlaceholder === next.renderPlaceholder &&
      next.isLast === prev.isLast &&
      next.text === prev.text
    )
  },
)

export default Leaf
