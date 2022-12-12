import type Y from 'yjs'

export interface Text {
  text: string
}

export const Text = {
  isText: (node: Node): node is Text => {
    return typeof node === 'object' && (node as Text).text !== undefined
  },
}

export interface Element {
  children: Node[]
  type?: string
}

export type Node = Element | Text

export type DeltaInsert = {
  insert: string | Y.XmlText
  attributes?: Record<string, unknown>
}

export type InsertDelta = Array<DeltaInsert>
