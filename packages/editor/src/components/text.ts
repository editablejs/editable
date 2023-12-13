import { Element, Text as SlateText } from '@editablejs/models'

import Leaf from './leaf'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { NODE_TO_ELEMENT, ELEMENT_TO_NODE, EDITOR_TO_KEY_TO_ELEMENT } from '../utils/weak-maps'
import { useEditableStatic } from '../hooks/use-editable'
import { Editable } from '../plugin/editable'
import { DATA_EDITABLE_NODE } from '../utils/constants'
import { useTextDecorations } from '../hooks/use-decorate'
import { PlaceholderRender } from '../plugin/placeholder'
import { html, useRef, virtual } from 'rezon'
import { spread } from 'rezon/directives/spread'

interface TextProps {
  isLast: boolean
  parent: Element
  text: SlateText
  renderPlaceholder?: PlaceholderRender
}
/**
 * Text.
 */
const Text = virtual<TextProps>(
  props => {
    const { isLast, parent, text, renderPlaceholder } = props
    const editor = useEditableStatic()
    const ref = useRef<HTMLSpanElement>(null)
    const key = Editable.findKey(editor, text)
    const path = Editable.findPath(editor, text)
    const decorates = useTextDecorations(text, path).map((d, index) => ({
      ...d,
      key: `__decorate__${index}`,
    }))

    const ranges = decorates
      .map(({ ranges, key }) => ranges.map(range => ({ ...range, [key]: true })))
      .flat()
    const leaves = SlateText.decorations(text, ranges)

    const decorateKeys = decorates.map(d => d.key)
    const children = []
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i]
      let content = Leaf({
        renderPlaceholder,
        isLast: isLast && i === leaves.length - 1,
        text,
        leaf,
        parent,
      })
      for (const key of decorateKeys) {
        if (key in leaf) {
          const dec = decorates[decorateKeys.indexOf(key)].decorate.renderText({
            node: text,
            path,
            children: content,
          })
          content = dec
        }
      }
      children.push(content)
    }
    // Update element-related weak maps with the DOM element ref.
    useIsomorphicLayoutEffect(() => {
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
      if (ref.current) {
        KEY_TO_ELEMENT?.set(key, ref.current)
        NODE_TO_ELEMENT.set(text, ref.current)
        ELEMENT_TO_NODE.set(ref.current, text)
      } else {
        KEY_TO_ELEMENT?.delete(key)
        NODE_TO_ELEMENT.delete(text)
      }
    })

    return html`<span ${spread({ [DATA_EDITABLE_NODE]: 'text', ref })}> ${children} </span>`
  },
  (prev, next) => {
    return (
      next.parent === prev.parent &&
      next.isLast === prev.isLast &&
      next.text === prev.text &&
      prev.renderPlaceholder === next.renderPlaceholder
    )
  },
)

export default Text
