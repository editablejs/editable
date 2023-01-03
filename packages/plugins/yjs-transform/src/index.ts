import * as Y from 'yjs'
import { DeltaInsert, InsertDelta } from './types'
import { yTextToInsertDelta } from './delta'
import { getProperties } from './editable'
import { Element, Node, Text } from './types'

export function yTextToSlateElement<T extends Element>(yText: Y.XmlText): T {
  const delta = yTextToInsertDelta(yText)

  const children =
    delta.length > 0 ? delta.map(deltaInsertToSlateNode) : yText.parent ? [{ text: '' }] : []

  return { ...yText.getAttributes(), children } as T
}

export function deltaInsertToSlateNode<T extends Node>(insert: DeltaInsert): T {
  if (typeof insert.insert === 'string') {
    return { ...insert.attributes, text: insert.insert } as T
  }

  return yTextToSlateElement(insert.insert) as T
}

export function slateNodesToInsertDelta<T extends Node>(nodes: T[]): InsertDelta {
  return nodes.map(node => {
    if (Text.isText(node)) {
      return { insert: node.text, attributes: getProperties(node) }
    }

    return { insert: slateElementToYText(node) }
  })
}

export function slateElementToYText<T extends Element>({ children, ...attributes }: T): Y.XmlText {
  const yElement = new Y.XmlText()

  Object.entries(attributes).forEach(([key, value]) => {
    yElement.setAttribute(key, value)
  })

  yElement.applyDelta(slateNodesToInsertDelta(children), { sanitize: false })
  return yElement
}

export * from './editable'

export * from './delta'

export * from './yjs'

export * from './object'

export * from './types'

export * from './clone'
