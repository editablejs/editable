import { direction } from 'direction'
import { Decoration, Editor, Node, Path, PlaceholderRender, Range, Element as SlateElement } from '@/interfaces'
import { append, setAttribute, createElement as createDOMElement, createRef } from '@/dom-utils'
import { createText } from "./text";
import { createNode } from "./node";
import { IS_ELEMENT, IS_INLINE_ELEMENT, IS_VOID_ELEMENT, NODE_TO_INDEX, NODE_TO_PARENT } from "@/utils/weak-maps";
import { connectNodeWithDOM } from '@/layout';
import { ElementAttributes } from '@/editor';
export interface CreateElementOptions {
  element: SlateElement
  path: Path
  selection: Range | null
  renderPlaceholder?: PlaceholderRender
}

export const createElement = (editor: Editor, options: CreateElementOptions) => {
  const { element, selection, renderPlaceholder, path } = options
  const isInline = editor.isInline(element)
  // const currentRenderPlaceholder = Placeholder.getActiveRender(editor, element)
  let children = createNode(editor, {
    node: element,
    selection,
    // renderPlaceholder: Editor.isEmpty(editor, element)
    //   ? currentRenderPlaceholder ?? renderPlaceholder
    //   : undefined,
  })
  const ref = createRef<HTMLElement>(null)
  const attributes: ElementAttributes<HTMLElement> = {
    ref,
  }

  // If it's a block node with inline children, add the proper `dir` attribute
  // for text direction.
  if (!isInline && Editor.hasInlines(editor, element)) {
    const text = Node.string(element)
    const dir = direction(text)

    if (dir === 'rtl') {
      attributes.dir = dir
    }
  }

  // If it's a void node, wrap the children in extra void-specific elements.
  const isVoid = Editor.isVoid(editor, element)
  if (isVoid) {
    const node = createDOMElement(isInline ? 'span' : 'div')
    setAttribute(node, 'style', 'height: 0; outline: none; color: transparent;')

    const [[text]] = Node.texts(element)

    const textNode = createText(editor, {
      // renderPlaceholder: currentRenderPlaceholder ?? renderPlaceholder,
      isLast: false,
      parent: element,
      path: path.concat(0),
      text,
    })
    append(node, textNode)

    children = node
    NODE_TO_INDEX.set(text, 0)
    NODE_TO_PARENT.set(text, element)
  }

  const newAttributes = editor.renderElementAttributes({ attributes, element })

  let content = editor.renderElement({ attributes: newAttributes, children, element })
  if (!ref.current) {
    ref.current = content
  }
  IS_VOID_ELEMENT.set(ref.current, isVoid)
  IS_INLINE_ELEMENT.set(ref.current, isInline)
  IS_ELEMENT.set(ref.current, true)

  connectNodeWithDOM(editor, element, ref.current)

  const decorates = Decoration.getElementDecorations(editor, element, path)

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
}
