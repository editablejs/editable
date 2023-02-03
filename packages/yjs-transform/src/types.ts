import type Y from 'yjs'
import type { Editor, Element, Node } from '@editablejs/models'
export type DeltaInsert = {
  insert: string | Y.XmlText
  attributes?: Record<string, unknown>
}

export type InsertDelta = Array<DeltaInsert>

export type RelativeRange = {
  anchor: Y.RelativePosition
  focus: Y.RelativePosition
}

export type TextRange = { start: number; end: number }

export type YTarget = {
  // TextRange in the yParent mapping to the editorTarget (or position to insert)
  textRange: TextRange

  // Y.XmlText containing the editor node
  yParent: Y.XmlText

  // Editor element mapping to the yParent
  editorParent: Element | Editor

  // If the target points to a editor element, Y.XmlText representing the target.
  // If it points to a text (or position to insert), this will be undefined.
  yTarget?: Y.XmlText

  // Editor node represented by the textRange, won't be set if position is insert.
  editorTarget?: Node

  // InsertDelta representing the editorTarget
  targetDelta: InsertDelta
}
