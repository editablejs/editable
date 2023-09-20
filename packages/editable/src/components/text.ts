import { DOMNode, Editor, Element, NodeEntry, Path, Range, Text as SlateText } from '@editablejs/models'
import { PlaceholderRender } from '../plugin/placeholder'
import { Editable } from '../plugin/editable'
import { Decorate, TextDecorate } from '../plugin/decorate'
import { createLeaf } from './leaf'
import { append, attr, detach, element, insert } from '../dom'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_PATH,
} from '../utils/weak-maps'
import { DATA_EDITABLE_NODE } from '../utils/constants'
import { shallow } from '../store'

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

interface TextDecorates {
  key: string
  decorate: TextDecorate
  ranges: Range[]
}

const getDecorates = (editor: Editable, entry: NodeEntry<SlateText>) => {
  const [text, path] = entry
  return Decorate.getTextDecorations(editor, text, path).map((d, index) => ({
    ...d,
    key: `__decorate__${index}`,
  }))
}

const getLeaves = (decorates: TextDecorates[], text: SlateText) => {
  const ranges = decorates
    .map(({ ranges, key }) => ranges.map(range => ({ ...range, [key]: true })))
    .flat()
  return SlateText.decorations(text, ranges)
}

interface CreateLeafWithDecorateOptions {
  decorates: TextDecorates[]
  leaf: SlateText
  text: SlateText
  path: Path
  isLast: boolean
  parent: Element
  renderPlaceholder?: PlaceholderRender
}

const createLeafWithDecorate = (editor: Editable, options: CreateLeafWithDecorateOptions) => {
  const { isLast, parent, text, renderPlaceholder, path, leaf, decorates } = options
  let content = createLeaf(editor, {
      renderPlaceholder,
      isLast,
      text,
      leaf,
      parent,
    })
    for (const { decorate } of decorates) {
        const dec = decorate.renderText({
          node: text,
          path,
          children: content,
        })
        content = dec.cloneNode(true)
    }
  return content
}

export const createText = (editor: Editable, options: CreateTextOptions) => {
  const { isLast, parent, text, renderPlaceholder, path } = options
  const key = Editable.findKey(editor, text)
  const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
  const textSpan = element('span')

  attr(textSpan, DATA_EDITABLE_NODE, 'text')

  NODE_TO_PATH.set(text, path)
  KEY_TO_ELEMENT?.set(key, textSpan)
  NODE_TO_ELEMENT.set(text, textSpan)
  ELEMENT_TO_NODE.set(textSpan, text)

  const decorates = getDecorates(editor, [text, path])
  const leaves = getLeaves(decorates, text)

  const children: Node[] = []
  const textToLeaves: TextToLeaf[] = []
  for (let i = 0; i < leaves.length; i++) {
    const leaf = leaves[i]
    const leafDecorates: TextDecorates[] = []
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

  NODE_TO_PATH.set(text, path)
  const [parent] = Editor.parent(editor, path)
  const isLast = parent.children[parent.children.length - 1] === text

  const decorates = getDecorates(editor, [text, path])
  const leaves = getLeaves(decorates, text)

  const currentLeaves = TEXT_TO_LEAVES.get(textSpan) ?? []
  // diff leaves
  const diffLeaves = leaves.filter((l, index) => {
    const current = currentLeaves[index]
    if (!current) return false
    return shallow(l, current.leaf) === false
  })
  const textToLeaves: TextToLeaf[] = []
  for (let i = 0; i < diffLeaves.length; i++) {
    const leaf = diffLeaves[i]
    const leafDecorates: TextDecorates[] = []
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
    insert(textSpan, content, currentLeaftElement)
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
      const leafDecorates: TextDecorates[] = []
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
      append(textSpan, content)
    }
  } else if (diffLeaves.length === 0) {
    return
  }

  TEXT_TO_LEAVES.set(textSpan, textToLeaves)
}
