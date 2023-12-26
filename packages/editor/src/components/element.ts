import getDirection from 'direction'
import { Editor, Node, Range, Element as SlateElement } from '@editablejs/models'

import Text from './text'
import useChildren from '../hooks/use-children'
import { Editable, useEditableStatic, ElementAttributes } from '..'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import {
  NODE_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_PARENT,
  NODE_TO_INDEX,
  EDITOR_TO_KEY_TO_ELEMENT,
} from '../utils/weak-maps'
import { DATA_EDITABLE_INLINE, DATA_EDITABLE_NODE, DATA_EDITABLE_VOID } from '../utils/constants'
import { useElementDecorations } from '../hooks/use-decorate'
import { PlaceholderRender } from '../plugin/placeholder'
import { usePlaceholder } from '../hooks/use-placeholder'
import { html, useRef, c } from 'rezon'

interface ElementProps {
  element: SlateElement
  selection: Range | null
  renderPlaceholder?: PlaceholderRender
}
/**
 * Element.
 */
const Element = c<ElementProps>(
  props => {
    const { element, selection, renderPlaceholder } = props
    const ref = useRef<HTMLElement>(null)
    const editor = useEditableStatic()
    const isInline = editor.isInline(element)
    const key = Editable.findKey(editor, element)

    const currentRenderPlaceholder = usePlaceholder(element)
    let children: unknown = useChildren({
      node: element,
      selection,
      renderPlaceholder: Editor.isEmpty(editor, element)
        ? currentRenderPlaceholder ?? renderPlaceholder
        : undefined,
    })

    // Attributes that the developer must mix into the element in their
    // custom node renderer component.
    const attributes: ElementAttributes = {
      [DATA_EDITABLE_NODE]: 'element',
      ref,
    }

    if (isInline) {
      attributes[DATA_EDITABLE_INLINE] = true
    }

    // If it's a block node with inline children, add the proper `dir` attribute
    // for text direction.
    if (!isInline && Editor.hasInlines(editor, element)) {
      const text = Node.string(element)
      const dir = getDirection(text)

      if (dir === 'rtl') {
        attributes.dir = dir
      }
    }

    // If it's a void node, wrap the children in extra void-specific elements.
    if (Editor.isVoid(editor, element)) {
      attributes[DATA_EDITABLE_VOID] = true

      const [[text]] = Node.texts(element)
      const renderChildren = (children: unknown) => {
        return isInline ? html`<span>${children}</span>` : html`<div>${children}</div>`
      }
      children = renderChildren(
        Text({
          renderPlaceholder: renderPlaceholder ?? currentRenderPlaceholder,
          isLast: false,
          parent: element,
          text,
        }),
      )

      NODE_TO_INDEX.set(text, 0)
      NODE_TO_PARENT.set(text, element)
    }

    // Update element-related weak maps with the DOM element ref.
    useIsomorphicLayoutEffect(() => {
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
      if (ref.current) {
        KEY_TO_ELEMENT?.set(key, ref.current)
        NODE_TO_ELEMENT.set(element, ref.current)
        ELEMENT_TO_NODE.set(ref.current, element)
      } else {
        KEY_TO_ELEMENT?.delete(key)
        NODE_TO_ELEMENT.delete(element)
      }
    })
    const path = Editable.findPath(editor, element)

    const newAttributes = editor.renderElementAttributes({ attributes, element })

    let content = editor.renderElement({ attributes: newAttributes, children, element })

    const decorates = useElementDecorations(element, path)

    if (decorates.length > 0) {
      content = decorates.reduceRight((children, decorate) => {
        return decorate.renderElement({
          node: element,
          path,
          children,
        })
      }, content)
    }

    return content
  },
  (prev, next) => {
    return (
      prev.element === next.element &&
      prev.renderPlaceholder === next.renderPlaceholder &&
      (prev.selection === next.selection ||
        (!!prev.selection && !!next.selection && Range.equals(prev.selection, next.selection)))
    )
  },
)

export default Element
