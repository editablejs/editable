import { Editor, Element, NodeEntry, Path, Range, Text as SlateText, Decoration, TextDecoration, PlaceholderRender } from '@/interfaces'

import { createLeaf } from './leaf'
import { append, setAttribute, detach, createElement, insert, DOMNode } from '@/dom-utils'
import { DATA_EDITABLE_NODE } from '@/utils/constants'
import { connectNodeWithDOM, refreshNodeWithDOMConnection } from '@/layout'

export interface CreateTextOptions {
  isLast: boolean
  parent: Element
  text: SlateText
  path: Path
  renderPlaceholder?: PlaceholderRender
}

interface TextToLeaf {
  leaf: SlateText
  node: DOMNode
}

const TEXT_TO_LEAVES = new WeakMap<DOMNode, TextToLeaf[]>()

interface TextDecorations {
  key: string
  decoration: TextDecoration
  ranges: Range[]
}

const getDecorates = (editor: Editor, entry: NodeEntry<SlateText>): TextDecorations[] => {
  const [text, path] = entry
  return Decoration.getTextDecorations(editor, text, path).map((d, index) => ({
    ...d,
    key: `__decorate__${index}`,
  }))
}

const getLeaves = (decorates: TextDecorations[], text: SlateText) => {
  const ranges = decorates
    .map(({ ranges, key }) => ranges.map(range => ({ ...range, [key]: true })))
    .flat()
  return SlateText.decorations(text, ranges)
}

interface CreateLeafWithDecorateOptions {
  decorates: TextDecorations[]
  leaf: SlateText
  text: SlateText
  path: Path
  isLast: boolean
  parent: Element
  renderPlaceholder?: PlaceholderRender
}

const createLeafWithDecorate = (editor: Editor, options: CreateLeafWithDecorateOptions) => {
  const { isLast, parent, text, renderPlaceholder, path, leaf, decorates } = options
  let content = createLeaf(editor, {
    renderPlaceholder,
    isLast,
    text,
    leaf,
    parent,
  })
  for (const { decoration } of decorates) {
    const dec = decoration.renderText({
      node: text,
      path,
      children: content,
    })
    content = dec.cloneNode(true) as HTMLElement
  }
  return content
}

export const createText = (editor: Editor, options: CreateTextOptions) => {
  const { isLast, parent, text, renderPlaceholder, path } = options

  const textSpan = createElement('span')

  setAttribute(textSpan, DATA_EDITABLE_NODE, 'text')
  connectNodeWithDOM(editor, text, textSpan)

  const decorates = getDecorates(editor, [text, path])
  const leaves = getLeaves(decorates, text)

  const children: Node[] = []
  const textToLeaves: TextToLeaf[] = []
  for (let i = 0; i < leaves.length; i++) {
    const leaf = leaves[i]
    const leafDecorates: TextDecorations[] = []
    for (const decorate of decorates) {
      if (decorate.key in leaf) {
        leafDecorates.push(decorate)
      }
    }
    decorates.filter(decorate => decorate.key in leaf)
    const content = createLeafWithDecorate(editor, {
      decorates: leafDecorates,
      leaf,
      text,
      path,
      isLast: isLast && i === leaves.length - 1,
      parent,
      renderPlaceholder,
    })
    textToLeaves.push({ leaf, node: content })
    children.push(content)
  }

  TEXT_TO_LEAVES.set(textSpan, textToLeaves)
  for (const child of children) {
    append(textSpan, child)
  }
  return textSpan
}

export interface UpdateTextOptions {
  renderPlaceholder?: PlaceholderRender
}

export const updateText = (
  editor: Editor,
  oldNode: NodeEntry,
  newNode: NodeEntry,
  options: UpdateTextOptions = {},
) => {
  const { renderPlaceholder } = options
  const [oldText] = oldNode
  const [text, path] = newNode
  if (!SlateText.isText(text)) throw new Error('newNode must be text')

  const textDOM = Editor.getDOMNode(editor, oldText)

  const [parent] = Editor.parent(editor, path)
  const isLast = parent.children[parent.children.length - 1] === text

  const decorates = getDecorates(editor, [text, path])
  const leaves = getLeaves(decorates, text)

  const currentLeaves = TEXT_TO_LEAVES.get(textDOM) ?? []
  // diff leaves
  const diffLeaves = leaves.filter((l, index) => {
    const current = currentLeaves[index]
    if (!current) return false
    return current.leaf !== l
  })
  const textToLeaves: TextToLeaf[] = []
  for (let i = 0; i < diffLeaves.length; i++) {
    const leaf = diffLeaves[i]
    const leafDecorates: TextDecorations[] = []
    for (const decorate of decorates) {
      if (decorate.key in leaf) {
        leafDecorates.push(decorate)
      }
    }
    const content = createLeafWithDecorate(editor, {
      decorates: leafDecorates,
      leaf,
      text,
      path,
      isLast: isLast && i === leaves.length - 1,
      parent,
      renderPlaceholder,
    })
    const currentLeaftElement = currentLeaves[i].node
    textToLeaves.push({ leaf, node: content })
    insert(textDOM, content, currentLeaftElement)
    detach(currentLeaftElement)
  }

  if (leaves.length < currentLeaves.length) {
    // remove leaves
    for (let i = leaves.length; i < currentLeaves.length; i++) {
      const element = currentLeaves[i].node
      if (element) {
        detach(element)
      }
    }
  } else if (leaves.length > currentLeaves.length) {
    // add leaves
    for (let i = currentLeaves.length; i < leaves.length; i++) {
      const leaf = leaves[i]
      const leafDecorates: TextDecorations[] = []
      for (const decorate of decorates) {
        if (decorate.key in leaf) {
          leafDecorates.push(decorate)
        }
      }
      const content = createLeafWithDecorate(editor, {
        decorates: leafDecorates,
        leaf,
        text,
        path,
        isLast: isLast && i === leaves.length - 1,
        parent,
        renderPlaceholder,
      })
      textToLeaves.push({ leaf, node: content })
      append(textDOM, content)
    }
  }

  refreshNodeWithDOMConnection(editor, text, textDOM)
  if (leaves.length !== currentLeaves.length || textToLeaves.length !== 0) TEXT_TO_LEAVES.set(textDOM, textToLeaves)
}
