import type { Editor, Element, Node } from '@editablejs/models'
import type Y from 'yjs'

export interface CursorData extends Record<string, unknown> {
  name: string
  color: string
  avatar?: string
}

export type CursorState<T extends CursorData = CursorData> = {
  relativeSelection: RelativeRange | null
  data?: T
  clientId: number
}

export type CaretPosition = {
  height: number
  top: number
  left: number
}

export type DeltaAttributes = {
  retain: number
  attributes: Record<string, unknown>
}
export type DeltaRetain = { retain: number }
export type DeltaDelete = { delete: number }
export type DeltaInsert = {
  insert: string | Y.XmlText
  attributes?: Record<string, unknown>
}

export type InsertDelta = Array<DeltaInsert>
export type Delta = Array<DeltaRetain | DeltaDelete | DeltaInsert | DeltaAttributes>

export type TextRange = { start: number; end: number }

export type HistoryStackItem = {
  meta: Map<string, unknown>
}

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

export type RelativeRange = {
  anchor: Y.RelativePosition
  focus: Y.RelativePosition
}
