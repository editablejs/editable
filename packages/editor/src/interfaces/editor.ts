import {
  Ancestor,
  Descendant,
  Element,
  Location,
  Node,
  NodeEntry,
  Operation,
  Path,
  PathRef,
  Point,
  PointRef,
  Range,
  RangeRef,
  Span,
  Text,
  Selection,
  Transforms,
  Drag,
  DrawingSelection,
  ElementAttributes,
  RenderElementAttributes,
  RenderElementProps,
  RenderLeafAttributes,
  RenderLeafProps,
  RenderPlaceholderProps,
  TextAttributes,
  GridCell,
  Key,
  Scrubber,
} from '..'
import {
  LeafEdge,
  MaximizeMode,
  RangeDirection,
  SelectionEdge,
  SelectionMode,
  TextDirection,
  TextUnit,
  TextUnitAdjustment,
} from '../types/types'
import { OmitFirstArg } from '../utils/types'
import { isEditor } from '../editor/is-editor'
import {
  TextInsertFragmentOptions,
  TextInsertTextOptions,
} from './transforms/text'
import { NodeInsertNodesOptions } from './transforms/node'
import { Grid } from './grid/grid'
import { DOMElement, DOMHTMLElement, DOMNode, DOMRange, DOMSelection, DOMStaticRange, isActiveElementInShadowRoot, isDOMElement, isDOMNode, isDOMSelection, isDOMText, isSingleTouchEvent, normalizePoint, retrieveMainEvent, DOMPoint, isDOMHTMLElement } from '@/dom-utils'
import { isChrome } from '@/dom-utils/is-chrome'
import { isFirefox } from '@/dom-utils/is_firefox'
import { getEditorPosition, findContentHostingElements, findNearbyElements, isVerticallyAligned, splitRectsIntoLines, findMaxLineRect, isRectInLine, closestEditorElement, walkEditorElement } from '@/layout'
import { getCharacterOffsetFromPosition } from '@/tokenizer'
import { NODE_TO_KEY, NODE_TO_PARENT, NODE_TO_INDEX, EDITOR_TO_KEY_TO_ELEMENT, EDITOR_TO_ELEMENT, ELEMENT_TO_NODE, EDITOR_TO_WINDOW, IS_VOID_ELEMENT, IS_TEXT_ELEMENT, IS_COMPOSING_ELEMENT, IS_STRING_ELEMENT, ZERO_WIDTH_ELEMENT, ZERO_WIDTH_ELEMENT_LENGTH, IS_LEAF_ELEMENT } from '@/utils'

/**
 * The `Editor` interface stores all the state of a Slate editor. It is extended
 * by plugins that wish to add their own helpers and implement new behaviors.
 */
export interface Editor {
  // Core state.

  children: Descendant[]
  selection: Selection
  operations: Operation[]

  // Overrideable core methods.

  apply: (operation: Operation) => void
  getDirtyPaths: (operation: Operation) => Path[]
  getFragment: (range?: Range) => Descendant[]
  normalizeSelection: (
    fn: (
      selection: Selection,
      options?: { grid: NodeEntry<Grid>; row: number; col: number },
    ) => void,
    at?: Location,
  ) => void
  isElementReadOnly: (element: Element) => boolean
  isSelectable: (element: Element) => boolean
  markableVoid: (element: Element) => boolean
  normalizeNode: (entry: NodeEntry, options?: { operation?: Operation }) => void
  onChange: (options?: { operation?: Operation }) => void
  shouldNormalize: ({
    iteration,
    dirtyPaths,
    operation,
  }: {
    iteration: number
    initialDirtyPathsLength: number
    dirtyPaths: Path[]
    operation?: Operation
  }) => boolean

  // Overrideable core transforms.

  addMark: OmitFirstArg<typeof Editor.addMark>
  collapse: OmitFirstArg<typeof Transforms.collapse>
  delete: OmitFirstArg<typeof Transforms.delete>
  deleteBackward: (unit: TextUnit) => void
  deleteForward: (unit: TextUnit) => void
  deleteFragment: OmitFirstArg<typeof Editor.deleteFragment>
  deselect: OmitFirstArg<typeof Transforms.deselect>
  insertBreak: OmitFirstArg<typeof Editor.insertBreak>
  insertFragment: OmitFirstArg<typeof Transforms.insertFragment>
  insertNode: OmitFirstArg<typeof Editor.insertNode>
  insertNodes: OmitFirstArg<typeof Transforms.insertNodes>
  insertSoftBreak: OmitFirstArg<typeof Editor.insertSoftBreak>
  insertText: OmitFirstArg<typeof Transforms.insertText>
  liftNodes: OmitFirstArg<typeof Transforms.liftNodes>
  mergeNodes: OmitFirstArg<typeof Transforms.mergeNodes>
  move: OmitFirstArg<typeof Transforms.move>
  moveNodes: OmitFirstArg<typeof Transforms.moveNodes>
  normalize: OmitFirstArg<typeof Editor.normalize>
  removeMark: OmitFirstArg<typeof Editor.removeMark>
  removeNodes: OmitFirstArg<typeof Transforms.removeNodes>
  select: OmitFirstArg<typeof Transforms.select>
  setNodes: <T extends Node>(
    props: Partial<T>,
    options?: {
      at?: Location
      match?: NodeMatch<T>
      mode?: MaximizeMode
      hanging?: boolean
      split?: boolean
      voids?: boolean
      compare?: PropsCompare
      merge?: PropsMerge
    }
  ) => void
  setNormalizing: OmitFirstArg<typeof Editor.setNormalizing>
  setPoint: OmitFirstArg<typeof Transforms.setPoint>
  setSelection: OmitFirstArg<typeof Transforms.setSelection>
  splitNodes: OmitFirstArg<typeof Transforms.splitNodes>
  unsetNodes: OmitFirstArg<typeof Transforms.unsetNodes>
  unwrapNodes: OmitFirstArg<typeof Transforms.unwrapNodes>
  withoutNormalizing: OmitFirstArg<typeof Editor.withoutNormalizing>
  wrapNodes: OmitFirstArg<typeof Transforms.wrapNodes>

  // Overrideable core queries.

  above: <T extends Ancestor>(
    options?: EditorAboveOptions<T>
  ) => NodeEntry<T> | undefined
  after: OmitFirstArg<typeof Editor.after>
  before: OmitFirstArg<typeof Editor.before>
  edges: OmitFirstArg<typeof Editor.edges>
  elementReadOnly: OmitFirstArg<typeof Editor.elementReadOnly>
  end: OmitFirstArg<typeof Editor.end>
  first: OmitFirstArg<typeof Editor.first>
  fragment: OmitFirstArg<typeof Editor.fragment>
  getMarks: OmitFirstArg<typeof Editor.marks>
  getElements: OmitFirstArg<typeof Editor.elements>
  hasBlocks: OmitFirstArg<typeof Editor.hasBlocks>
  hasInlines: OmitFirstArg<typeof Editor.hasInlines>
  hasPath: OmitFirstArg<typeof Editor.hasPath>
  hasTexts: OmitFirstArg<typeof Editor.hasTexts>
  isBlock: OmitFirstArg<typeof Editor.isBlock>
  isEdge: OmitFirstArg<typeof Editor.isEdge>
  isEmpty: OmitFirstArg<typeof Editor.isEmpty>
  isEnd: OmitFirstArg<typeof Editor.isEnd>
  isInline: OmitFirstArg<typeof Editor.isInline>
  isNormalizing: OmitFirstArg<typeof Editor.isNormalizing>
  isStart: OmitFirstArg<typeof Editor.isStart>
  isVoid: OmitFirstArg<typeof Editor.isVoid>
  isSolid: OmitFirstArg<typeof Editor.isSolid>
  last: OmitFirstArg<typeof Editor.last>
  leaf: OmitFirstArg<typeof Editor.leaf>
  levels: <T extends Node>(
    options?: EditorLevelsOptions<T>
  ) => Generator<NodeEntry<T>, void, undefined>
  next: <T extends Descendant>(
    options?: EditorNextOptions<T>
  ) => NodeEntry<T> | undefined
  node: OmitFirstArg<typeof Editor.node>
  nodes: <T extends Node>(
    options?: EditorNodesOptions<T>
  ) => Generator<NodeEntry<T>, void, undefined>
  parent: OmitFirstArg<typeof Editor.parent>
  path: OmitFirstArg<typeof Editor.path>
  pathRef: OmitFirstArg<typeof Editor.pathRef>
  pathRefs: OmitFirstArg<typeof Editor.pathRefs>
  point: OmitFirstArg<typeof Editor.point>
  pointRef: OmitFirstArg<typeof Editor.pointRef>
  pointRefs: OmitFirstArg<typeof Editor.pointRefs>
  positions: OmitFirstArg<typeof Editor.positions>
  previous: <T extends Node>(
    options?: EditorPreviousOptions<T>
  ) => NodeEntry<T> | undefined
  range: OmitFirstArg<typeof Editor.range>
  rangeRef: OmitFirstArg<typeof Editor.rangeRef>
  rangeRefs: OmitFirstArg<typeof Editor.rangeRefs>
  start: OmitFirstArg<typeof Editor.start>
  string: OmitFirstArg<typeof Editor.string>
  unhangRange: OmitFirstArg<typeof Editor.unhangRange>
  void: OmitFirstArg<typeof Editor.void>
  blur: OmitFirstArg<typeof Editor.blur>
  focus: OmitFirstArg<typeof Editor.focus>
  copy: OmitFirstArg<typeof Editor.copy>
  cut: OmitFirstArg<typeof Editor.cut>
  selectWord: OmitFirstArg<typeof Editor.selectWord>
  selectLine: OmitFirstArg<typeof Editor.selectLine>
  isComposing: OmitFirstArg<typeof Editor.isComposing>
  isFocused: OmitFirstArg<typeof Editor.isFocused>
  isReadonly: OmitFirstArg<typeof Editor.isReadonly>
  insertFromClipboard: OmitFirstArg<typeof Editor.insertFromClipboard>
  insertTextFromClipboard: OmitFirstArg<typeof Editor.insertTextFromClipboard>
  insertFile: OmitFirstArg<typeof Editor.insertFile>
  onKeydown: (event: KeyboardEvent) => void
  onKeyup: (event: KeyboardEvent) => void
  onFocus: () => void
  onBlur: () => void
  onReadonly: (readonly: boolean) => void
  onPaste: (event: ClipboardEvent) => void
  onCut: (event: ClipboardEvent) => void
  onCopy: (event: ClipboardEvent) => void
  onInput: (value: string) => void
  onBeforeInput: (value: string) => void
  onCompositionStart: (value: string) => void
  onCompositionEnd: (value: string) => void
  onSelectStart: () => void
  onSelecting: () => void
  onSelectEnd: () => void
  onSelectionChange: () => void
  onDrawingSelectionChange: (selection: DrawingSelection | null) => void
  onDragChange: (drag: Drag | null) => void
  onTouchHold: (event: TouchEvent) => void
  onTouchTrack: () => void
  onContextMenu: (event: MouseEvent) => void
  onLocaleChange: () => void
  onRenderComplete: () => void
  onDestory: () => void
  toDataTransfer: (range?: Range) => DataTransfer | null
  renderElementAttributes: (props: RenderElementAttributes) => ElementAttributes
  renderLeafAttributes: (props: RenderLeafAttributes) => TextAttributes
  renderElement: (props: RenderElementProps) => HTMLElement
  renderLeaf: (props: RenderLeafProps) => HTMLElement
  renderPlaceholder: (props: RenderPlaceholderProps) => DOMNode | void | null
}


export type EditorMarks = Omit<Text, 'text'>

export type EditorElements = Record<string, NodeEntry<Element>[]>

export interface EditorAboveOptions<T extends Ancestor> {
  at?: Location
  match?: NodeMatch<T>
  mode?: MaximizeMode
  voids?: boolean
}

export interface EditorAfterOptions {
  distance?: number
  unit?: TextUnitAdjustment
  voids?: boolean
}

export interface EditorBeforeOptions {
  distance?: number
  unit?: TextUnitAdjustment
  voids?: boolean
}

export interface EditorDirectedDeletionOptions {
  unit?: TextUnit
}

export interface EditorElementReadOnlyOptions {
  at?: Location
  mode?: MaximizeMode
  voids?: boolean
}

export interface EditorFragmentDeletionOptions {
  direction?: TextDirection
}

export interface EditorLeafOptions {
  depth?: number
  edge?: LeafEdge
}

export interface EditorLevelsOptions<T extends Node> {
  at?: Location
  match?: NodeMatch<T>
  reverse?: boolean
  voids?: boolean
}

export interface EditorNextOptions<T extends Descendant> {
  at?: Location
  match?: NodeMatch<T>
  mode?: SelectionMode
  voids?: boolean
}

export interface EditorNodeOptions {
  depth?: number
  edge?: LeafEdge
}

export interface EditorNodesOptions<T extends Node> {
  at?: Location | Span
  match?: NodeMatch<T>
  mode?: SelectionMode
  universal?: boolean
  reverse?: boolean
  voids?: boolean
  ignoreNonSelectable?: boolean
}

export interface EditorNormalizeOptions {
  force?: boolean
  operation?: Operation
}

export interface EditorParentOptions {
  depth?: number
  edge?: LeafEdge
}

export interface EditorPathOptions {
  depth?: number
  edge?: LeafEdge
}

export interface EditorPathRefOptions {
  affinity?: TextDirection | null
}

export interface EditorPointOptions {
  edge?: LeafEdge
}

export interface EditorPointRefOptions {
  affinity?: TextDirection | null
}

export interface EditorPositionsOptions {
  at?: Location
  unit?: TextUnitAdjustment
  reverse?: boolean
  voids?: boolean
  ignoreNonSelectable?: boolean
}

export interface EditorPreviousOptions<T extends Node> {
  at?: Location
  match?: NodeMatch<T>
  mode?: SelectionMode
  voids?: boolean
}

export interface EditorRangeRefOptions {
  affinity?: RangeDirection | null
}

export interface EditorStringOptions {
  voids?: boolean
}

export interface EditorUnhangRangeOptions {
  voids?: boolean
}

export interface EditorVoidOptions {
  at?: Location
  mode?: MaximizeMode
  voids?: boolean
}

export interface EditorInterface {
  /**
   * Blur the editor.
   */
  blur: (editor: Editor) => void

  /**
   * Focus the editor.
   */
  focus: (editor: Editor, start?: boolean) => void

  /**
   * Copy the content of the selection to the clipboard.
   */
  copy: (editor: Editor, range?: Range) => void

  /**
   * Cut the content of the selection to the clipboard.
   */
  cut: (editor: Editor, range?: Range) => void

  /**
   * Select a word at a location.
  */
  selectWord: (editor: Editor, at?: Location, edge?: SelectionEdge) => void

  /**
   * Select a line at a location.
   */
  selectLine: (editor: Editor, at?: Location, edge?: SelectionEdge) => void
  /**
   * Check if the user is currently composing inside the editor.
   */
  isComposing: (editor: Editor) => boolean

  /**
   * Check if the editor is focused.
   */
  isFocused: (editor: Editor) => boolean

  /**
   * Check if the editor is readonly.
   */
  isReadonly: (editor: Editor) => boolean
  /**
   * Insert data from clipboard at a location.
   */
  insertFromClipboard: (editor: Editor, at?: Range) => void

  /**
   * Insert text from clipboard at a location.
   */
  insertTextFromClipboard: (editor: Editor, at?: Range) => void

  /**
   * Insert a file at a location.
   */
  insertFile: (editor: Editor, file: File, at?: Range) => void
  /**
   * Get the ancestor above a location in the document.
   */
  above: <T extends Ancestor>(
    editor: Editor,
    options?: EditorAboveOptions<T>
  ) => NodeEntry<T> | undefined

  /**
   * Add a custom property to the leaf text nodes in the current selection.
   *
   * If the selection is currently collapsed, the marks will be added to the
   * `editor.marks` property instead, and applied when text is inserted next.
   */
  addMark: (editor: Editor, key: string, value: any) => void

  /**
   * Get the point after a location.
   */
  after: (
    editor: Editor,
    at: Location,
    options?: EditorAfterOptions
  ) => Point | undefined

  /**
   * Get the point before a location.
   */
  before: (
    editor: Editor,
    at: Location,
    options?: EditorBeforeOptions
  ) => Point | undefined

  /**
   * Delete content in the editor backward from the current selection.
   */
  deleteBackward: (
    editor: Editor,
    options?: EditorDirectedDeletionOptions
  ) => void

  /**
   * Delete content in the editor forward from the current selection.
   */
  deleteForward: (
    editor: Editor,
    options?: EditorDirectedDeletionOptions
  ) => void

  /**
   * Delete the content in the current selection.
   */
  deleteFragment: (
    editor: Editor,
    options?: EditorFragmentDeletionOptions
  ) => void

  /**
   * Get the start and end points of a location.
   */
  edges: (editor: Editor, at: Location) => [Point, Point]

  /**
   * Match a read-only element in the current branch of the editor.
   */
  elementReadOnly: (
    editor: Editor,
    options?: EditorElementReadOnlyOptions
  ) => NodeEntry<Element> | undefined

  /**
   * Get the end point of a location.
   */
  end: (editor: Editor, at: Location) => Point

  /**
   * Get the first node at a location.
   */
  first: (editor: Editor, at: Location) => NodeEntry

  /**
   * Get the fragment at a location.
   */
  fragment: (editor: Editor, at: Location) => Descendant[]

  /**
   * Check if a node has block children.
   */
  hasBlocks: (editor: Editor, element: Element) => boolean

  /**
   * Check if a node has inline and text children.
   */
  hasInlines: (editor: Editor, element: Element) => boolean

  hasPath: (editor: Editor, path: Path) => boolean

  /**
   * Check if a node has text children.
   */
  hasTexts: (editor: Editor, element: Element) => boolean

  /**
   * Insert a block break at the current selection.
   *
   * If the selection is currently expanded, it will be deleted first.
   */
  insertBreak: (editor: Editor) => void

  /**
   * Inserts a fragment
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertFragment: (
    editor: Editor,
    fragment: Node[],
    options?: TextInsertFragmentOptions
  ) => void

  /**
   * Atomically inserts `nodes`
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertNode: <T extends Node>(
    editor: Editor,
    node: Node,
    options?: NodeInsertNodesOptions<T>
  ) => void

  /**
   * Insert a soft break at the current selection.
   *
   * If the selection is currently expanded, it will be deleted first.
   */
  insertSoftBreak: (editor: Editor) => void

  /**
   * Insert a string of text
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertText: (
    editor: Editor,
    text: string,
    options?: TextInsertTextOptions
  ) => void

  /**
   * Check if a value is a block `Element` object.
   */
  isBlock: (editor: Editor, value: Element) => boolean

  /**
   * Check if a point is an edge of a location.
   */
  isEdge: (editor: Editor, point: Point, at: Location) => boolean

  /**
   * Check if a value is an `Editor` object.
   */
  isEditor: (value: any) => value is Editor

  /**
   * Check if a value is a read-only `Element` object.
   */
  isElementReadOnly: (editor: Editor, element: Element) => boolean

  /**
   * Check if an element is empty, accounting for void nodes.
   */
  isEmpty: (editor: Editor, element: Node) => boolean

  /**
   * Check if a point is the end point of a location.
   */
  isEnd: (editor: Editor, point: Point, at: Location) => boolean

  /**
   * Check if a value is an inline `Element` object.
   */
  isInline: (editor: Editor, value: Element) => boolean

  /**
   * Check if the editor is currently normalizing after each operation.
   */
  isNormalizing: (editor: Editor) => boolean

  /**
   * Check if a value is a selectable `Element` object.
   */
  isSelectable: (editor: Editor, element: Element) => boolean

  /**
   * Check if a point is the start point of a location.
   */
  isStart: (editor: Editor, point: Point, at: Location) => boolean

  /**
   * Check if a value is a void `Element` object.
   */
  isVoid: (editor: Editor, value: Element) => boolean

  isSolid: (editor: Editor, value: Element) => boolean

  /**
   * Get the last node at a location.
   */
  last: (editor: Editor, at: Location) => NodeEntry

  /**
   * Get the leaf text node at a location.
   */
  leaf: (
    editor: Editor,
    at: Location,
    options?: EditorLeafOptions
  ) => NodeEntry<Text>

  /**
   * Iterate through all of the levels at a location.
   */
  levels: <T extends Node>(
    editor: Editor,
    options?: EditorLevelsOptions<T>
  ) => Generator<NodeEntry<T>, void, undefined>

  /**
   * Get the marks that would be added to text at the current selection.
   */
  marks: (editor: Editor, at?: Location) => Omit<Text, 'text'> | null


  elements: (editor: Editor, at?: Location) => EditorElements

  /**
   * Get the matching node in the branch of the document after a location.
   */
  next: <T extends Descendant>(
    editor: Editor,
    options?: EditorNextOptions<T>
  ) => NodeEntry<T> | undefined

  /**
   * Get the node at a location.
   */
  node: (editor: Editor, at: Location, options?: EditorNodeOptions) => NodeEntry

  /**
   * Iterate through all of the nodes in the Editor.
   */
  nodes: <T extends Node>(
    editor: Editor,
    options?: EditorNodesOptions<T>
  ) => Generator<NodeEntry<T>, void, undefined>

  /**
   * Normalize any dirty objects in the editor.
   */
  normalize: (editor: Editor, options?: EditorNormalizeOptions) => void

  /**
   * Get the parent node of a location.
   */
  parent: (
    editor: Editor,
    at: Location,
    options?: EditorParentOptions
  ) => NodeEntry<Ancestor>

  /**
   * Get the path of a location.
   */
  path: (editor: Editor, at: Location, options?: EditorPathOptions) => Path

  /**
   * Create a mutable ref for a `Path` object, which will stay in sync as new
   * operations are applied to the editor.
   */
  pathRef: (
    editor: Editor,
    path: Path,
    options?: EditorPathRefOptions
  ) => PathRef

  /**
   * Get the set of currently tracked path refs of the editor.
   */
  pathRefs: (editor: Editor) => Set<PathRef>

  /**
   * Get the start or end point of a location.
   */
  point: (editor: Editor, at: Location, options?: EditorPointOptions) => Point

  /**
   * Create a mutable ref for a `Point` object, which will stay in sync as new
   * operations are applied to the editor.
   */
  pointRef: (
    editor: Editor,
    point: Point,
    options?: EditorPointRefOptions
  ) => PointRef

  /**
   * Get the set of currently tracked point refs of the editor.
   */
  pointRefs: (editor: Editor) => Set<PointRef>

  /**
   * Return all the positions in `at` range where a `Point` can be placed.
   *
   * By default, moves forward by individual offsets at a time, but
   * the `unit` option can be used to to move by character, word, line, or block.
   *
   * The `reverse` option can be used to change iteration direction.
   *
   * Note: By default void nodes are treated as a single point and iteration
   * will not happen inside their content unless you pass in true for the
   * `voids` option, then iteration will occur.
   */
  positions: (
    editor: Editor,
    options?: EditorPositionsOptions
  ) => Generator<Point, void, undefined>

  /**
   * Get the matching node in the branch of the document before a location.
   */
  previous: <T extends Node>(
    editor: Editor,
    options?: EditorPreviousOptions<T>
  ) => NodeEntry<T> | undefined

  /**
   * Get a range of a location.
   */
  range: (editor: Editor, at: Location, to?: Location) => Range

  /**
   * Create a mutable ref for a `Range` object, which will stay in sync as new
   * operations are applied to the editor.
   */
  rangeRef: (
    editor: Editor,
    range: Range,
    options?: EditorRangeRefOptions
  ) => RangeRef

  /**
   * Get the set of currently tracked range refs of the editor.
   */
  rangeRefs: (editor: Editor) => Set<RangeRef>

  /**
   * Remove a custom property from all of the leaf text nodes in the current
   * selection.
   *
   * If the selection is currently collapsed, the removal will be stored on
   * `editor.marks` and applied to the text inserted next.
   */
  removeMark: (editor: Editor, key: string) => void

  /**
   * Manually set if the editor should currently be normalizing.
   *
   * Note: Using this incorrectly can leave the editor in an invalid state.
   *
   */
  setNormalizing: (editor: Editor, isNormalizing: boolean) => void

  /**
   * Get the start point of a location.
   */
  start: (editor: Editor, at: Location) => Point

  /**
   * Get the text string content of a location.
   *
   * Note: by default the text of void nodes is considered to be an empty
   * string, regardless of content, unless you pass in true for the voids option
   */
  string: (
    editor: Editor,
    at: Location,
    options?: EditorStringOptions
  ) => string

  /**
   * Convert a range into a non-hanging one.
   */
  unhangRange: (
    editor: Editor,
    range: Range,
    options?: EditorUnhangRangeOptions
  ) => Range

  /**
   * Match a void node in the current branch of the editor.
   */
  void: (
    editor: Editor,
    options?: EditorVoidOptions
  ) => NodeEntry<Element> | undefined

  /**
   * Call a function, deferring normalization until after it completes.
   */
  withoutNormalizing: (editor: Editor, fn: () => void) => void

  /**
   * Check if the selection is at the start or end of a line.
   */
  isSelectionAtLineEdge: (editor: Editor, options?: { point?: Point; edge?: SelectionEdge }) => boolean


  /**
   * Find a key for a Editor node.
   */
  findKey: (editor: Editor, node: Node) => Key

  /**
   * Find the path of Editor node.
   */
  findPath: (editor: Editor, node: Node) => Path

  /**
   * Check if a DOM node is within the editor.
   */
  hasDOMNode: (editor: Editor, node: DOMNode) => boolean

  /**
   * Find the native DOM element from a Editor node.
   */
  getDOMNode: <T extends boolean = false>(editor: Editor, node: Node, suppressThrow?: T) => T extends true ? DOMElement | null : DOMElement

  /**
   * Find a native DOM selection point from a Editor point.
   */
  getDOMPoint: (editor: Editor, point: Point) => DOMPoint

  /**
   * Find a native DOM range from a Editor `range`.
   *
   * Notice: the returned range will always be ordinal regardless of the direction of Editor `range` due to DOM API limit.
   *
   * there is no way to create a reverse DOM Range using Range.setStart/setEnd
   * according to https://dom.spec.whatwg.org/#concept-range-bp-set.
   */
  getDOMRange: (editor: Editor, range: Range) => DOMRange

  /**
   * Find a Editor node from a native DOM `element`.
   */
  getEditorNode: (editor: Editor, element: DOMNode) => Node

  /**
   * Find a Editor point from a DOM selection's `offsetNode` and `domOffset`.
   */
  getEditorPoint: <T extends boolean>(
    editor: Editor,
    domPoint: DOMPoint,
    options: {
      exactMatch: T
      suppressThrow: T
    },
  ) => T extends true ? Point | null : Point

  /**
   * Get the target point from a DOM `event`.
   */
  getEditorPointFromDOMEvent: (editor: Editor, event: TouchEvent | MouseEvent | Touch) => Point | null

  /**
   * Get previous line point from a Editor range.
   */
  getPreviousLinePoint: (editor: Editor, at?: Range) => Point | null

  /**
   * Get next line point from a Editor range.
   */
  getNextLinePoint: (editor: Editor, at?: Range) => Point | null

  /**
   * Get the line edge point from a Editor range.
   */
  getLineEdgePoint: (editor: Editor, options?: { at?: Range; edge?: 'start' | 'end' }) => Point | null

  /**
   * Get the nearest point from a DOM position.
   */
  getNearestPointFromDOMPosition: (editor: Editor, node: DOMNode, position: { x: number, y: number }) => Point | null

  /**
   * Find a Editor range from a DOM range or selection.
   */
  getEditorRange: <T extends boolean>(
    editor: Editor,
    domRange: DOMRange | DOMStaticRange | DOMSelection,
    options: {
      exactMatch: T
      suppressThrow: T
    },
  ) => T extends true ? Range | null : Range

  /**
   * Get a Editor position
   */
  getEditorPosition: (editor: Editor) => { x: number; y: number }

  /**
   * Return the host window of the current editor.
   */
  getWindow: (editor: Editor) => Window

  /**
   * Find the DOM node that implements DocumentOrShadowRoot for the editor.
   */
  getDocumentOrShadowRoot: (editor: Editor) => Document | ShadowRoot

  /**
   * Get the selected line element and its index within the selection range.
   */
  getSelectedLine: (editor: Editor, options?: { range?: Range; match?: (element: Element) => boolean }) => [Element, number] | null

  /**
   * Get the line rectangles of a given node in an editor.
   */
  getLineRectsFromNode: (editor: Editor, node: Node, minWidth?: number) => DOMRect[]

  /**
   * Get the line rectangles of a given range in an editor.
   */
  getLineRectsFromRange: (editor: Editor, range: Range, minWidth?: number) => DOMRect[]

  /**
   * From all the text within the Block node located at the Point position, and recalculate Point.offset The offset located in all the text
   */
  getBlockTextAndOffsetFromPoint: (editor: Editor, point: Point) => { text: string; offset: number }

  /**
   * Get the sub point from the Block node text and offset
   */
  getSubPointFromBlockTextAndOffset: (editor: Editor, blockPath: Path, offset: number, toNext?: boolean) => Point


}

// eslint-disable-next-line no-redeclare
export const Editor: EditorInterface = {
  blur(editor: Editor): void {
    editor.blur()
  },

  focus(editor: Editor, start = false): void {
    editor.focus(start)
  },

  copy(editor: Editor, range?: Range): void {
    editor.copy(range)
  },

  cut(editor: Editor, range?: Range): void {
    editor.cut(range)
  },

  selectWord(editor: Editor, at?: Location, edge?: SelectionEdge): void {
    editor.selectWord(at, edge)
  },

  selectLine(editor: Editor, at?: Location, edge?: SelectionEdge): void {
    editor.selectLine(at, edge)
  },

  isComposing(editor: Editor): boolean {
    return editor.isComposing()
  },

  isFocused(editor: Editor): boolean {
    return editor.isFocused()
  },

  isReadonly(editor: Editor): boolean {
    return editor.isReadonly()
  },

  insertFromClipboard(editor: Editor, at?: Range): void {
    editor.insertFromClipboard(at)
  },

  insertTextFromClipboard(editor: Editor, at?: Range): void {
    editor.insertTextFromClipboard(at)
  },

  insertFile(editor: Editor, file: File, at?: Range): void {
    editor.insertFile(file, at)
  },

  above(editor, options) {
    return editor.above(options)
  },

  addMark(editor, key, value) {
    editor.addMark(key, value)
  },

  after(editor, at, options) {
    return editor.after(at, options)
  },

  before(editor, at, options) {
    return editor.before(at, options)
  },

  deleteBackward(editor, options = {}) {
    const { unit = 'character' } = options
    editor.deleteBackward(unit)
  },

  deleteForward(editor, options = {}) {
    const { unit = 'character' } = options
    editor.deleteForward(unit)
  },

  deleteFragment(editor, options) {
    editor.deleteFragment(options)
  },

  edges(editor, at) {
    return editor.edges(at)
  },

  elementReadOnly(editor: Editor, options: EditorElementReadOnlyOptions = {}) {
    return editor.elementReadOnly(options)
  },

  end(editor, at) {
    return editor.end(at)
  },

  first(editor, at) {
    return editor.first(at)
  },

  fragment(editor, at) {
    return editor.fragment(at)
  },

  hasBlocks(editor, element) {
    return editor.hasBlocks(element)
  },

  hasInlines(editor, element) {
    return editor.hasInlines(element)
  },

  hasPath(editor, path) {
    return editor.hasPath(path)
  },

  hasTexts(editor, element) {
    return editor.hasTexts(element)
  },

  insertBreak(editor) {
    editor.insertBreak()
  },

  insertFragment(editor, fragment, options) {
    editor.insertFragment(fragment, options)
  },

  insertNode(editor, node) {
    editor.insertNode(node)
  },

  insertSoftBreak(editor) {
    editor.insertSoftBreak()
  },

  insertText(editor, text) {
    editor.insertText(text)
  },

  isBlock(editor, value) {
    return editor.isBlock(value)
  },

  isEdge(editor, point, at) {
    return editor.isEdge(point, at)
  },

  isEditor(value: any): value is Editor {
    return isEditor(value)
  },

  isElementReadOnly(editor, element) {
    return editor.isElementReadOnly(element)
  },

  isEmpty(editor, element) {
    return editor.isEmpty(element)
  },

  isEnd(editor, point, at) {
    return editor.isEnd(point, at)
  },

  isInline(editor, value) {
    return editor.isInline(value)
  },

  isNormalizing(editor) {
    return editor.isNormalizing()
  },

  isSelectable(editor: Editor, value: Element) {
    return editor.isSelectable(value)
  },

  isStart(editor, point, at) {
    return editor.isStart(point, at)
  },

  isVoid(editor, value) {
    return editor.isVoid(value)
  },

  isSolid(editor, value) {
    return editor.isSolid(value)
  },

  last(editor, at) {
    return editor.last(at)
  },

  leaf(editor, at, options) {
    return editor.leaf(at, options)
  },

  levels(editor, options) {
    return editor.levels(options)
  },

  marks(editor, at) {
    return editor.getMarks(at)
  },

  elements(editor, at) {
    return editor.getElements(at)
  },

  next<T extends Descendant>(
    editor: Editor,
    options?: EditorNextOptions<T>
  ): NodeEntry<T> | undefined {
    return editor.next(options)
  },

  node(editor, at, options) {
    return editor.node(at, options)
  },

  nodes(editor, options) {
    return editor.nodes(options)
  },

  normalize(editor, options) {
    editor.normalize(options)
  },

  parent(editor, at, options) {
    return editor.parent(at, options)
  },

  path(editor, at, options) {
    return editor.path(at, options)
  },

  pathRef(editor, path, options) {
    return editor.pathRef(path, options)
  },

  pathRefs(editor) {
    return editor.pathRefs()
  },

  point(editor, at, options) {
    return editor.point(at, options)
  },

  pointRef(editor, point, options) {
    return editor.pointRef(point, options)
  },

  pointRefs(editor) {
    return editor.pointRefs()
  },

  positions(editor, options) {
    return editor.positions(options)
  },

  previous(editor, options) {
    return editor.previous(options)
  },

  range(editor, at, to) {
    return editor.range(at, to)
  },

  rangeRef(editor, range, options) {
    return editor.rangeRef(range, options)
  },

  rangeRefs(editor) {
    return editor.rangeRefs()
  },

  removeMark(editor, key) {
    editor.removeMark(key)
  },

  setNormalizing(editor, isNormalizing) {
    editor.setNormalizing(isNormalizing)
  },

  start(editor, at) {
    return editor.start(at)
  },

  string(editor, at, options) {
    return editor.string(at, options)
  },

  unhangRange(editor, range, options) {
    return editor.unhangRange(range, options)
  },

  void(editor, options) {
    return editor.void(options)
  },

  withoutNormalizing(editor, fn: () => void) {
    editor.withoutNormalizing(fn)
  },
  isSelectionAtLineEdge: (editor: Editor, options: { point?: Point; edge?: SelectionEdge } = {}): boolean => {
    const { point = editor.selection?.focus, edge = 'start' } = options
    if (!point) return false
    const entry = Editor.above(editor, { at: point, match: n => Element.isElement(n) && Editor.isBlock(editor, n) })
    if (!entry) return false
    const [block] = entry
    const rangeLines = Editor.getLineRectsFromRange(editor, { anchor: point, focus: point })
    if (rangeLines.length === 0) return false
    const rangeLine = rangeLines[0]
    const lines = Editor.getLineRectsFromNode(editor, block)
    for (const line of lines) {
      if (
        ~['start', 'anchor'].indexOf(edge) &&
        line.left === rangeLine.left &&
        line.top === rangeLine.top
      ) {
        return true
      } else if (
        ~['end', 'focus'].indexOf(edge) &&
        line.right === rangeLine.right &&
        line.top === rangeLine.top
      ) {
        return true
      }
    }
    return false
  },



  findKey(editor: Editor, node: Node): Key {
    let key = NODE_TO_KEY.get(node)

    if (!key) {
      key = Key.create()
      NODE_TO_KEY.set(node, key)
    }

    return key
  },

  findPath(editor: Editor, node: Node): Path {
    const path: Path = []
    let child = node

    while (true) {
      const parent = NODE_TO_PARENT.get(child)

      if (parent == null) {
        if (Editor.isEditor(child)) {
          return path
        } else {
          break
        }
      }

      const i = NODE_TO_INDEX.get(child)

      if (i == null) {
        break
      }

      path.unshift(i)
      child = parent
    }

    throw new Error(
      `Unable to find the path for Slate node: ${Scrubber.stringify(node)}`
    )
  },

  hasDOMNode: (editor: Editor, node: DOMNode): boolean => {
    const editorEl = Editor.getDOMNode(editor, editor, true)
    if (!editorEl) return false
    let targetEl

    // COMPAT: In Firefox, reading `target.nodeType` will throw an error if
    // target is originating from an internal "restricted" element (e.g. a
    // stepper arrow on a number input). (2018/05/04)
    // https://github.com/ianstormtaylor/slate/issues/1819
    try {
      targetEl = (isDOMElement(node) ? node : node.parentElement) as HTMLElement
    } catch (err: any) {
      if (!err.message.includes('Permission denied to access property "nodeType"')) {
        throw err
      }
    }

    if (!targetEl) {
      return false
    }

    return editorEl.contains(targetEl)
  },

  getDOMNode: <T extends boolean = false>(editor: Editor, node: Node, suppressThrow?: T): T extends true ? DOMElement | null : DOMElement => {
    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
    const offsetNode = Editor.isEditor(node)
      ? EDITOR_TO_ELEMENT.get(editor)
      : KEY_TO_ELEMENT?.get(Editor.findKey(editor, node))
    if (!offsetNode) {
      if (suppressThrow) return null as T extends true ? DOMElement | null : DOMElement
      throw new Error(`Cannot resolve a DOM node from Editor node: ${Scrubber.stringify(node)}`)
    }
    return offsetNode
  },

  getDOMPoint: (editor: Editor, point: Point): DOMPoint => {
    const [node] = Editor.node(editor, point.path)
    const el = Editor.getDOMNode(editor, node)
    let domPoint: DOMPoint | undefined

    // If we're inside a void node, force the offset to 0, otherwise the zero
    // width spacing character will result in an incorrect offset of 1
    if (Editor.void(editor, { at: point })) {
      point = { path: point.path, offset: 0 }
    }

    // For each leaf, we need to isolate its content, which means filtering
    // to its direct text and zero-width spans. (We have to filter out any
    // other siblings that may have been rendered alongside them.)
    const texts = walkEditorElement(el, node => IS_COMPOSING_ELEMENT.has(node) || IS_STRING_ELEMENT.has(node) || ZERO_WIDTH_ELEMENT.has(node))
    let start = 0

    for (const text of texts) {
      const offsetNode = text.childNodes[0] as HTMLElement

      if (offsetNode == null || offsetNode.textContent == null) {
        continue
      }

      const { length } = offsetNode.textContent
      const value = ZERO_WIDTH_ELEMENT_LENGTH.get(text)
      const trueLength = value == null ? length : value
      const end = start + trueLength

      if (point.offset <= end) {
        const offset = Math.min(length, Math.max(0, point.offset - start))
        domPoint = [offsetNode, offset]
        break
      }

      start = end
    }

    if (!domPoint) {
      throw new Error(`Cannot resolve a DOM point from Editor point: ${Scrubber.stringify(point)}`)
    }

    return domPoint
  },

  getDOMRange: (editor: Editor, range: Range): DOMRange => {
    const { anchor, focus } = range
    const isBackward = Range.isBackward(range)
    const domAnchor = Editor.getDOMPoint(editor, anchor)
    const domFocus = Range.isCollapsed(range) ? domAnchor : Editor.getDOMPoint(editor, focus)

    const window = Editor.getWindow(editor)
    const domRange = window.document.createRange()
    const [startNode, startOffset] = isBackward ? domFocus : domAnchor
    const [endNode, endOffset] = isBackward ? domAnchor : domFocus

    // A editor Point at zero-width Leaf always has an offset of 0 but a native DOM selection at
    // zero-width node has an offset of 1 so we have to check if we are in a zero-width node and
    // adjust the offset accordingly.
    const startEl = (isDOMElement(startNode) ? startNode : startNode.parentElement) as HTMLElement
    const isStartAtZeroWidth = ZERO_WIDTH_ELEMENT.has(startEl)
    const endEl = (isDOMElement(endNode) ? endNode : endNode.parentElement) as HTMLElement
    const isEndAtZeroWidth = ZERO_WIDTH_ELEMENT.has(endEl)

    domRange.setStart(startNode, isStartAtZeroWidth ? 1 : startOffset)
    domRange.setEnd(endNode, isEndAtZeroWidth ? 1 : endOffset)
    return domRange
  },

  getEditorNode: (editor: Editor, element: DOMNode): Node => {
    let domEl = isDOMElement(element) ? element : element.parentElement

    if (domEl) {
      domEl = closestEditorElement(domEl)
    }

    const node = domEl ? ELEMENT_TO_NODE.get(domEl as HTMLElement) : null

    if (!node) {
      throw new Error(`Cannot resolve a Editor node from DOM node: ${domEl}`)
    }

    return node
  },

  getEditorPoint: <T extends boolean>(
    editor: Editor,
    domPoint: DOMPoint,
    options: {
      exactMatch: T
      suppressThrow: T
    },
  ): T extends true ? Point | null : Point => {
    const { exactMatch, suppressThrow } = options
    const [nearestNode, nearestOffset] = exactMatch ? domPoint : normalizePoint(domPoint)
    const parentNode = nearestNode.parentNode as DOMElement
    let textNode: DOMElement | null = null
    let offset = 0

    if (parentNode) {
      const editorEl = Editor.getDOMNode(editor, editor)
      const potentialVoidNode = closestEditorElement(parentNode, node => isDOMHTMLElement(node) && IS_VOID_ELEMENT.has(node))
      // Need to ensure that the closest void node is actually a void node
      // within this editor, and not a void node within some parent editor. This can happen
      // if this editor is within a void node of another editor ("nested editors", like in
      // the "Layout Voids" example on the docs site).
      const voidNode =
        potentialVoidNode && editorEl.contains(potentialVoidNode) ? potentialVoidNode : null
      let leafNode = closestEditorElement(parentNode, IS_LEAF_ELEMENT.has)
      let offsetNode: DOMElement | null = null

      // Calculate how far into the text node the `nearestNode` is, so that we
      // can determine what the offset relative to the text node is.
      if (leafNode) {
        textNode = closestEditorElement(leafNode, node => isDOMHTMLElement(node) && IS_TEXT_ELEMENT.has(node))

        if (textNode) {
          const window = Editor.getWindow(editor)
          const range = window.document.createRange()
          range.setStart(textNode, 0)
          range.setEnd(nearestNode, nearestOffset)

          const contents = range.cloneContents()
          const removals = walkEditorElement(contents, ZERO_WIDTH_ELEMENT.has)

          removals.forEach(el => {
            el!.parentNode!.removeChild(el)
          })

          // COMPAT: Edge has a bug where Range.prototype.toString() will
          // convert \n into \r\n. The bug causes a loop when slate-react
          // attempts to reposition its cursor to match the native position. Use
          // textContent.length instead.
          // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10291116/
          offset = contents.textContent!.length
          offsetNode = textNode
        }
      } else if (voidNode) {
        // For void nodes, the element with the offset key will be a cousin, not an
        // ancestor, so find it by going down from the nearest void parent.
        leafNode = walkEditorElement(voidNode, IS_LEAF_ELEMENT.has)![0]

        // COMPAT: In read-only editors the leaf is not rendered.
        if (!leafNode) {
          offset = 1
        } else {
          textNode = closestEditorElement(leafNode, node => isDOMHTMLElement(node) && IS_TEXT_ELEMENT.has(node))
          offsetNode = leafNode
          offset = offsetNode.textContent!.length
          walkEditorElement(offsetNode, ZERO_WIDTH_ELEMENT.has).forEach(el => {
            offset -= el.textContent!.length
          })
        }
      }

      if (
        offsetNode &&
        offset === offsetNode.textContent!.length &&
        // COMPAT: If the parent node is a Editor zero-width space, editor is
        // because the text node should have no characters. However, during IME
        // composition the ASCII characters will be prepended to the zero-width
        // space, so subtract 1 from the offset to account for the zero-width
        // space character.
        (ZERO_WIDTH_ELEMENT.has(parentNode) ||
          // COMPAT: In Firefox, `range.cloneContents()` returns an extra trailing '\n'
          // when the document ends with a new-line character. This results in the offset
          // length being off by one, so we need to subtract one to account for this.
          (isFirefox && offsetNode.textContent?.endsWith('\n\n')))
      ) {
        offset--
      }
    }

    if (!textNode) {
      if (suppressThrow) {
        return null as T extends true ? Point | null : Point
      }
      throw new Error(`Cannot resolve a Editor point from DOM point: ${domPoint}`)
    }

    // COMPAT: If someone is clicking from one Editor editor into another,
    // the select event fires twice, once for the old editor's `element`
    // first, and then afterwards for the correct `element`. (2017/03/03)
    const editorNode = Editor.getEditorNode(editor, textNode!)
    const path = Editor.findPath(editor, editorNode)
    return { path, offset } as T extends true ? Point | null : Point
  },

  getEditorPosition: getEditorPosition,

  getEditorPointFromDOMEvent: (editor: Editor, event: TouchEvent | MouseEvent | Touch): Point | null => {
    event = retrieveMainEvent(event)
    const { clientX: x, clientY: y } = event

    if (x == null || y == null) {
      throw new Error(`Cannot resolve a Editor range from a DOM event: ${event}`)
    }
    let target = event.target
    if (isSingleTouchEvent(event)) {
      target = document.elementFromPoint(event.clientX, event.clientY)
    }
    if (!target) {
      throw new Error(`Cannot resolve a Editor range from a DOM event: ${event}`)
    }

    return Editor.getNearestPointFromDOMPosition(editor, target as DOMNode, {
      x, y
    })
  },

  getPreviousLinePoint: (editor: Editor, at?: Range): Point | null => {
    const { selection } = editor
    if (!at && selection) at = selection
    if (!at) return null
    const startPoint = Range.start(at)
    const endPoint = Range.end(at)
    const startRange = Editor.getDOMRange(editor, { anchor: startPoint, focus: startPoint })
    const endRange = Editor.getDOMRange(editor, { anchor: endPoint, focus: endPoint })

    const startRects = startRange.getClientRects()
    const endRects = endRange.getClientRects()

    const block = Editor.above(editor, {
      at: at.focus,
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    })
    let top = endRects[0].top
    let isFind = false

    let isSameLine = true

    let prevBlock = block
    let domBlock: DOMElement | null = null
    while (prevBlock && !isFind) {
      const [block, path] = prevBlock
      domBlock = Editor.getDOMNode(editor, block)
      const lowestElements = findContentHostingElements(editor, block)
      for (let l = lowestElements.length - 1; l >= 0 && !isFind; l--) {
        const lowestElement = lowestElements[l]
        const rects = lowestElement.getClientRects()
        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i]
          if (rect.height === 0) continue
          if (rect.bottom <= top) {
            isFind = true
            top = rect.bottom - rect.height / 2
            break
          }
        }
      }
      if (!isFind) {
        isSameLine = false
        prevBlock = Editor.previous(editor, {
          at: path,
          match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        })
      }
    }
    if (!domBlock) return null
    return Editor.getNearestPointFromDOMPosition(
      editor,
      domBlock,
      {
        x: isFind && !isSameLine ? startRects[0].x : 0,
        y: top
      }
    )
  },

  getNextLinePoint: (editor: Editor, at?: Range): Point | null => {
    const { selection } = editor
    if (!at && selection) at = selection
    if (!at) return null
    const startPoint = Range.start(at)
    const endPoint = Range.end(at)
    const startRange = Editor.getDOMRange(editor, { anchor: startPoint, focus: startPoint })
    const endRange = Editor.getDOMRange(editor, { anchor: endPoint, focus: endPoint })

    const startRects = startRange.getClientRects()
    const endRects = endRange.getClientRects()

    let blockEntry = Editor.above(editor, {
      at: at.focus,
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    })
    let bottom = endRects[0].bottom
    let isFind = false
    let isSameLine = true
    let domBlock: DOMElement | null = null
    while (blockEntry && !isFind) {
      const [block, path] = blockEntry
      domBlock = Editor.getDOMNode(editor, block)
      const lowestElements = findContentHostingElements(editor, block)
      for (let l = 0; l < lowestElements.length && !isFind; l++) {
        const lowestElement = lowestElements[l]
        const rects = lowestElement.getClientRects()
        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i]
          if (rect.height === 0) continue
          if (rect.top >= bottom) {
            isFind = true
            bottom = rect.top + rect.height / 2
            break
          }
        }
      }
      if (!isFind) {
        blockEntry = Editor.next(editor, {
          at: path,
          match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        })
        isSameLine = false
      }
    }
    if (!domBlock) return null

    return Editor.getNearestPointFromDOMPosition(
      editor,
      domBlock,
      {
        x: isFind && !isSameLine ? startRects[0].x : 99999,
        y: bottom
      },
    )
  },

  getLineEdgePoint: (editor: Editor, { at, edge }: { at?: Range; edge?: 'start' | 'end' } = {}): Point | null => {
    const { selection } = editor
    if (!at && selection) at = selection
    if (!at) return null
    const isStart = edge === 'start'
    const point = isStart ? Range.start(at) : Range.end(at)
    const range = Editor.getDOMRange(editor, {
      anchor: point,
      focus: point,
    })
    range.collapse(isStart)
    const rects = range.getClientRects()
    const rect = rects[rects.length - 1]
    const bottom = rect.top + rect.height / 2
    const block = Editor.above(editor, {
      at: point,
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    })
    if (!block) return null
    const domBlock = Editor.getDOMNode(editor, block[0])
    return Editor.getNearestPointFromDOMPosition(editor, domBlock, {
      x: isStart ? -99999 : 99999,
      y: bottom
    })
  },

  getNearestPointFromDOMPosition: (editor: Editor, node: DOMNode, position: { x: number, y: number }): Point | null => {
    const domEl = isDOMElement(node) ? node : node.parentElement
    if (!domEl) return null
    const { x, y } = position
    const elements: DOMElement[] = []
    let element: DOMElement | null = closestEditorElement(domEl)

    const addToElements = (node: Node) => {
      const children = findContentHostingElements(editor, node)
      for (const child of children) {
        if (~elements.indexOf(child)) continue
        elements.push(child)
      }
    }

    if (!element) {
      const nodes = Node.nodes(editor)
      for (const [node] of nodes) {
        addToElements(node)
      }
    } else {
      const node = Editor.getEditorNode(editor, element)
      if (Text.isText(node) || Editor.isVoid(editor, node)) {
        addToElements(node)
      } else {
        if (!Editor.isSolid(editor, node)) {
          const rect = element.getBoundingClientRect()
          const reverse = x < rect.left + rect.width / 2
          const adjacent = (reverse ? Editor.previous : Editor.next)(editor, {
            at: Editor.findPath(editor, node),
          })
          if (adjacent) {
            addToElements(adjacent[0])
          }
        } else {
          const isGrid = Grid.isGrid(node)
          const nodes = Editor.nodes(editor, {
            at: Editor.findPath(editor, node),
            match: n => (isGrid && GridCell.isGridCell(n)) || Text.isText(n),
            mode: 'highest',
          })
          for (const [child] of nodes) {
            if (Element.isElement(child) && Editor.isBlock(editor, child)) {
              elements.push(Editor.getDOMNode(editor, child))
            } else addToElements(child)
          }
        }
      }
    }
    let top = y,
      left = x
    const nodes = findNearbyElements(elements, x, y)
    if (!nodes) return null
    let offsetNode: DOMElement | null = null
    if (isDOMNode(nodes)) {
      offsetNode = nodes
    } else {
      const { top: nearbyTop, left: nearbyLeft, right: nearbyRight, bottom: nearbyBelow } = nodes

      if (nearbyLeft && nearbyBelow) {
        if (isVerticallyAligned(nearbyBelow.rect, nearbyLeft.rect)) {
          offsetNode = nearbyBelow.element
          top = nearbyBelow.rect.top
        } else {
          offsetNode = nearbyLeft.element
          left = nearbyLeft.rect.right
        }
      } else if (nearbyRight && nearbyBelow) {
        if (isVerticallyAligned(nearbyBelow.rect, nearbyRight.rect)) {
          offsetNode = nearbyBelow.element
          top = nearbyBelow.rect.top
        } else {
          offsetNode = nearbyRight.element
          left = nearbyRight.rect.left
        }
      } else if (nearbyLeft) {
        offsetNode = nearbyLeft.element
        if (left <= nearbyLeft.rect.left) left = nearbyLeft.rect.left
        else if (left >= nearbyLeft.rect.right) left = nearbyLeft.rect.right
        else {
          top = nearbyLeft.rect.top
        }
      } else if (nearbyRight) {
        offsetNode = nearbyRight.element
        if (left <= nearbyRight.rect.left) left = nearbyRight.rect.left
        else if (left >= nearbyRight.rect.right) left = nearbyRight.rect.right
        else {
          top = nearbyRight.rect.top
        }
      } else if (nearbyBelow) {
        if (left < nearbyBelow.rect.left) {
          left = nearbyBelow.rect.left
        } else if (left > nearbyBelow.rect.right) {
          left = nearbyBelow.rect.right
        }
        top = nearbyBelow.rect.top
        offsetNode = nearbyBelow.element
      } else if (nearbyTop) {
        offsetNode = nearbyTop.element
        if (left < nearbyTop.rect.left) {
          left = nearbyTop.rect.left
        } else if (left > nearbyTop.rect.right) {
          left = nearbyTop.rect.right
        }
        top = nearbyTop.rect.bottom
      }
    }
    if (!offsetNode) return null
    const _node = Editor.getEditorNode(editor, offsetNode)
    if (Text.isText(_node)) {
      const path = Editor.findPath(editor, _node)
      if (_node.text.length === 0) {
        return {
          path,
          offset: 0,
        }
      }
      const textNodes = findContentHostingElements(editor, _node)
      let startOffset = 0
      for (let s = 0; s < textNodes.length; s++) {
        const textNode = textNodes[s]
        if (textNode === offsetNode) break
        startOffset += (textNode.textContent ?? '').length
      }
      const textNode = isDOMText(offsetNode) ? offsetNode : offsetNode.firstChild
      if (!isDOMText(textNode)) return null
      const content = textNode.textContent ?? ''
      const offset = getCharacterOffsetFromPosition(textNode, left, top, 0, content.length, content.length)
      return {
        path,
        offset: startOffset + offset,
      }
    } else if (Element.isElement(_node)) {
      const point = Editor.getEditorPoint(editor, [offsetNode, 0], {
        exactMatch: false,
        suppressThrow: true,
      })
      if (!point) return Editor.start(editor, Editor.findPath(editor, _node))
      return point
    }
    return null
  },

  getEditorRange: <T extends boolean>(
    editor: Editor,
    domRange: DOMRange | DOMStaticRange | DOMSelection,
    options: {
      exactMatch: T
      suppressThrow: T
    },
  ): T extends true ? Range | null : Range => {
    const { exactMatch, suppressThrow } = options
    const el = isDOMSelection(domRange) ? domRange.anchorNode : domRange.startContainer
    let anchorNode
    let anchorOffset
    let focusNode
    let focusOffset
    let isCollapsed

    if (el) {
      if (isDOMSelection(domRange)) {
        anchorNode = domRange.anchorNode
        anchorOffset = domRange.anchorOffset
        focusNode = domRange.focusNode
        focusOffset = domRange.focusOffset
        // COMPAT: There's a bug in chrome that always returns `true` for
        // `isCollapsed` for a Selection that comes from a ShadowRoot.
        // (2020/08/08)
        // https://bugs.chromium.org/p/chromium/issues/detail?id=447523
        if (isChrome && isActiveElementInShadowRoot()) {
          isCollapsed =
            domRange.anchorNode === domRange.focusNode &&
            domRange.anchorOffset === domRange.focusOffset
        } else {
          isCollapsed = domRange.isCollapsed
        }
      } else {
        anchorNode = domRange.startContainer
        anchorOffset = domRange.startOffset
        focusNode = domRange.endContainer
        focusOffset = domRange.endOffset
        isCollapsed = domRange.collapsed
      }
    }

    if (anchorNode == null || focusNode == null || anchorOffset == null || focusOffset == null) {
      throw new Error(`Cannot resolve a Editor range from DOM range: ${domRange}`)
    }

    const anchor = Editor.getEditorPoint(editor, [anchorNode, anchorOffset], {
      exactMatch,
      suppressThrow,
    })
    if (!anchor) {
      return null as T extends true ? Range | null : Range
    }

    const focus = isCollapsed
      ? anchor
      : Editor.getEditorPoint(editor, [focusNode, focusOffset], {
        exactMatch,
        suppressThrow,
      })
    if (!focus) {
      return null as T extends true ? Range | null : Range
    }

    let range: Range = { anchor: anchor as Point, focus: focus as Point }
    // if the selection is a hanging range that ends in a void
    // and the DOM focus is an Element
    // (meaning that the selection ends before the element)
    // unhang the range to avoid mistakenly including the void
    if (
      Range.isExpanded(range) &&
      Range.isForward(range) &&
      isDOMElement(focusNode) &&
      Editor.void(editor, { at: range.focus, mode: 'highest' })
    ) {
      range = Editor.unhangRange(editor, range, { voids: true })
    }

    return range as unknown as T extends true ? Range | null : Range
  },

  getWindow: (editor: Editor): Window => {
    const window = EDITOR_TO_WINDOW.get(editor)
    if (!window) {
      throw new Error('Unable to find a host window element for this editor')
    }
    return window
  },

  getDocumentOrShadowRoot: (editor: Editor): Document | ShadowRoot => {
    const el = Editor.getDOMNode(editor, editor)
    const root = el.getRootNode()

    if (
      (root instanceof Document || root instanceof ShadowRoot) &&
      (root as any).getSelection != null
    ) {
      return root
    }

    return el.ownerDocument
  },

  getSelectedLine: (editor, options = {}) => {
    const { range = editor.selection, match = () => true } = options
    if (!range || Range.isCollapsed(range)) return null
    const start = Range.start(range)
    const entry = Editor.above(editor, { at: start, match: n => Element.isElement(n) && Editor.isBlock(editor, n) })
    if (!entry) return null
    const rangeLines = Editor.getLineRectsFromRange(editor, range)
    let [block, path] = entry
    while (block) {
      if (match(block)) {
        const elLines = Editor.getLineRectsFromNode(editor, block)
        for (const rangeLine of rangeLines) {
          const index = elLines.findIndex(
            elLine =>
              elLine.left === rangeLine.left &&
              elLine.top === rangeLine.top &&
              elLine.width === rangeLine.width,
          )
          if (~index) {
            return [block, index]
          }
        }
      }
      const next = Editor.next(editor, { at: path, match: n => Element.isElement(n) && Editor.isBlock(editor, n) })
      if (!next) return null
      const [n, p] = next
      block = n as Element
      path = p
    }
    return null
  },

  getLineRectsFromNode: (editor, node, minWidth = 4) => {
    const path = Editor.findPath(editor, node);
    const blockEntry: NodeEntry | undefined =
      Element.isElement(node) && Editor.isBlock(editor, node) && path.length === 1
        ? [node, path]
        : Editor.above<Element>(editor, {
          at: path,
          match: n => Element.isElement(n) && Editor.isBlock(editor, n),
          mode: 'highest',
        });
    if (!blockEntry) return [];
    const editorDomElement = Editor.getDOMNode(editor, blockEntry[0]);
    const editorDomRectangle = editorDomElement.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(Editor.getDOMNode(editor, node));
    const splitLineRectangles = splitRectsIntoLines(range.getClientRects());
    const lineRectangles: DOMRect[] = [];
    for (const [line, rects] of splitLineRectangles) {
      let width = line.right - line.left;
      const lineRectangle = findMaxLineRect(editor, editorDomElement, line.top, line.bottom);
      line.top = lineRectangle.top;
      line.height = lineRectangle.height;
      line.bottom = lineRectangle.bottom;
      // 空节点的宽度给个最小值
      if (width < 1 && editorDomRectangle.left === rects[0].left) {
        width = minWidth;
      }
      lineRectangles.push(new DOMRect(rects[0].left, line.top, width, line.height));
    }
    return lineRectangles;
  },

  getLineRectsFromRange: (editor, range, minWidth = 4) => {
    const anchor = Range.start(range)
    const focus = Range.end(range)
    // Get the block node at the start position
    const startBlockEntry = Editor.above<Element>(editor, {
      at: anchor,
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      mode: 'lowest',
    })
    // Get the block node at the end position
    const endBlockEntry = Editor.above<Element>(editor, {
      at: focus,
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      mode: 'lowest',
    })
    if (!startBlockEntry || !endBlockEntry) return []

    const blockRects: DOMRect[] = []
    const rectMap: Map<
      DOMRect,
      {
        domElement: DOMElement
        element: Element
      }
    > = new Map()

    let [startBlock, startPath] = startBlockEntry
    let [_, endPath] = endBlockEntry
    const ranges: DOMRange[] = []
    let isStart = true
    let next: NodeEntry<Element> | undefined = startBlockEntry
    while (next) {
      const [nextBlock, nextPath] = next as NodeEntry<Element>
      const domElement = Editor.getDOMNode(editor, nextBlock)
      const rect = domElement.getBoundingClientRect()
      rectMap.set(rect, {
        domElement,
        element: nextBlock,
      })
      blockRects.push(rect)

      if (Path.equals(nextPath, endPath)) break
      if (!isStart) {
        const range = document.createRange()
        range.selectNodeContents(domElement)
        ranges.push(range)
      } else {
        isStart = false
      }
      next = Editor.next<Element>(editor, {
        at: nextPath,
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      })
    }
    if (Path.equals(startPath, endPath)) {
      ranges.unshift(Editor.getDOMRange(editor, range))
    } else {
      ranges.unshift(
        Editor.getDOMRange(editor, {
          anchor,
          focus: Editor.end(editor, startPath),
        }),
      )
      ranges.push(
        Editor.getDOMRange(editor, {
          anchor: Editor.start(editor, endPath),
          focus,
        }),
      )
    }

    // Split the lines
    const rects: DOMRect[] = []
    for (const range of ranges) {
      rects.push(...range.getClientRects())
    }
    const lines = splitRectsIntoLines(rects)
    const lineRects: DOMRect[] = []
    let prevLineRect: DOMRect | null = null
    for (const [line, rects] of lines) {
      // Find the corresponding element for the line
      const blockRect = blockRects.find(
        r =>
          isRectInLine(r, line) &&
          (line.left >= r.left || Math.abs(line.left - r.left) < 1) &&
          (line.right <= r.right || Math.abs(line.right - r.right) < 1),
      )
      const block = blockRect ? rectMap.get(blockRect) : null

      let width = line.right - line.left
      if (block) {
        const { domElement, element } = block
        const lineRect = findMaxLineRect(editor, domElement, line.top, line.bottom)
        line.top = lineRect.top
        line.height = lineRect.height
        // Set a minimum width for empty nodes
        if (
          domElement &&
          Editor.isEmpty(editor, element) &&
          width < 1 &&
          domElement.getBoundingClientRect().left === line.left
        ) {
          width = minWidth
        }
      }
      // Remove overlapping parts between lines
      if (prevLineRect && prevLineRect.bottom > line.top) {
        const diffVal = prevLineRect.bottom - line.top
        line.top += diffVal
        line.height -= diffVal
      }
      const lineRect = new DOMRect(rects[0].left, line.top, width, line.height)

      prevLineRect = lineRect
      lineRects.push(lineRect)
    }
    return lineRects
  },

  getBlockTextAndOffsetFromPoint: (editor, point) => {
    const blockEntry = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      at: point,
    })
    const data = {
      text: '',
      offset: 0,
    }
    if (!blockEntry) {
      throw new Error(`Cannot resolve a Editor block from a point: ${point}`)
    }
    const textNodes = Node.texts(blockEntry[0])
    let isFindOffset = false
    for (const [textNode, textPath] of textNodes) {
      let { text } = textNode
      const path = blockEntry[1].concat(textPath)
      const [parent] = Editor.parent(editor, path)
      if (parent && Editor.isVoid(editor, parent)) {
        text = ''
      }
      if (Path.equals(path, point.path)) {
        data.offset += point.offset
        isFindOffset = true
      } else if (!isFindOffset) {
        data.offset += text.length
      }
      data.text += text
    }
    return data
  },

  getSubPointFromBlockTextAndOffset: (editor, path, offset, toNext) => {
    const blockEntry = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      at: path,
    })
    if (!blockEntry) {
      throw new Error(`Cannot resolve a Editor block from a path: ${path}`)
    }
    const textNodes = Node.texts(blockEntry[0])
    let findOffset = 0
    for (const [textNode, textPath] of textNodes) {
      let { text } = textNode
      const path = blockEntry[1].concat(textPath)
      const [parent, parentPath] = Editor.parent(editor, path)
      const isVoid = parent && Editor.isVoid(editor, parent)
      if (isVoid) {
        text = ' '
      }
      const textLength = text.length
      const totalOffset = findOffset + textLength
      if (totalOffset >= offset) {
        if (toNext && offset > 0 && totalOffset === offset) {
          const next = Editor.next(editor, {
            at: isVoid ? parentPath : path,
          })
          if (next) {
            return {
              path: next[1],
              offset: 0,
            }
          }
        }
        return { path, offset: textLength - (totalOffset - offset) }
      } else {
        findOffset += textLength
      }
    }
    return { path, offset }
  }
}

/**
 * A helper type for narrowing matched nodes with a predicate.
 */

export type NodeMatch<T extends Node> =
  | ((node: Node, path: Path) => node is T)
  | ((node: Node, path: Path) => boolean)

export type PropsCompare = (prop: Partial<Node>, node: Partial<Node>) => boolean
export type PropsMerge = (prop: Partial<Node>, node: Partial<Node>) => object
