import { DOMNode, Editor, Element, NodeEntry, Text as SlateText } from '@editablejs/models'
import { PlaceholderRender } from '../plugin/placeholder'
import { Editable } from '../plugin/editable'
import { Decorate } from '../plugin/decorate'
import { createLeaf } from './leaf'
import { append, attr, detach, element, insert } from '../dom'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
} from '../utils/weak-maps'
import { DATA_EDITABLE_NODE } from '../utils/constants'
import { shallow } from '../store'

export interface CreateTextOptions {
  isLast: boolean
  parent: Element
  text: SlateText
  renderPlaceholder?: PlaceholderRender
}

const TEXT_TO_LEAVES = new WeakMap<DOMNode, SlateText[]>()
const LEAF_TO_ELEMENT = new WeakMap<SlateText, Node>()
export const createText = (editor: Editable, options: CreateTextOptions) => {
  const { isLast, parent, text, renderPlaceholder } = options
  const key = Editable.findKey(editor, text)
  const path = Editable.findPath(editor, text)

  const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
  const textSpan = element('span')

  attr(textSpan, DATA_EDITABLE_NODE, 'text')

  KEY_TO_ELEMENT?.set(key, textSpan)
  NODE_TO_ELEMENT.set(text, textSpan)
  ELEMENT_TO_NODE.set(textSpan, text)

  const decorates = Decorate.getTextDecorations(editor, text, path).map((d, index) => ({
    ...d,
    key: `__decorate__${index}`,
  }))

  const ranges = decorates
    .map(({ ranges, key }) => ranges.map(range => ({ ...range, [key]: true })))
    .flat()
  const leaves = SlateText.decorations(text, ranges)
  TEXT_TO_LEAVES.set(textSpan, leaves)
  const decorateKeys = decorates.map(d => d.key)
  const children: Node[] = []
  for (let i = 0; i < leaves.length; i++) {
    const leaf = leaves[i]
    let content = createLeaf(editor, {
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
        content = dec.cloneNode(true)
      }
    }

    LEAF_TO_ELEMENT.set(leaf, content)
    children.push(content)
  }

  for (const child of children) {
    append(textSpan, child)
  }
  return textSpan
}

export interface UpdateTextOptions {
  renderPlaceholder?: PlaceholderRender
}

export const updateText = (
  editor: Editable,
  textEntry: NodeEntry<SlateText>,
  options: UpdateTextOptions = {},
) => {
  const { renderPlaceholder } = options
  const [text, path] = textEntry

  const textSpan = Editable.toDOMNode(editor, text)
  if (!textSpan) {
    throw new Error('Cannot find text element')
  }

  const [parent] = Editor.parent(editor, path)
  const index = parent.children.indexOf(text)
  NODE_TO_INDEX.set(text, index)
  NODE_TO_PARENT.set(text, parent)

  const decorates = Decorate.getTextDecorations(editor, text, path).map((d, index) => ({
    ...d,
    key: `__decorate__${index}`,
  }))

  const ranges = decorates
    .map(({ ranges, key }) => ranges.map(range => ({ ...range, [key]: true })))
    .flat()
  const leaves = SlateText.decorations(text, ranges)
  const decorateKeys = decorates.map(d => d.key)
  const currentLeaves = TEXT_TO_LEAVES.get(textSpan) ?? []
  TEXT_TO_LEAVES.set(textSpan, leaves)
  // diff leaves
  const diffLeaves = leaves.filter((l, index) => {
    const current = currentLeaves[index]
    if (!current) return false
    return shallow(l, current) === false
  })

  for (let i = 0; i < diffLeaves.length; i++) {
    const leaf = diffLeaves[i]
    let content = createLeaf(editor, {
      renderPlaceholder,
      isLast: i === leaves.length - 1,
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
        content = dec.cloneNode(true)
      }
    }
    const currentLeaftElement = LEAF_TO_ELEMENT.get(leaf)
    LEAF_TO_ELEMENT.set(leaf, content)
    if (!currentLeaftElement) throw new Error('Cannot find leaf element')
    insert(textSpan, content, currentLeaftElement)
    detach(currentLeaftElement)
  }

  if (leaves.length < currentLeaves.length) {
    // remove leaves
    for (let i = leaves.length; i < currentLeaves.length; i++) {
      const leaf = currentLeaves[i]
      const element = LEAF_TO_ELEMENT.get(leaf)
      if (element) {
        detach(element)
      }
    }
  } else if (leaves.length > currentLeaves.length) {
    // add leaves
    for (let i = currentLeaves.length; i < leaves.length; i++) {
      const leaf = leaves[i]
      let content = createLeaf(editor, {
        renderPlaceholder,
        isLast: i === leaves.length - 1,
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
          content = dec.cloneNode(true)
        }
      }

      LEAF_TO_ELEMENT.set(leaf, content)
      append(textSpan, content)
    }
  }
}
