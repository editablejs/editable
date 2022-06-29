import { NodeInterface, ModelInterface, NodeKey, Op } from "@editablejs/model"
import { RangeInterface, SelectionInterface } from "@editablejs/selection"

export interface ActiveState {
  types: string[]
  format: Map<string, (string | number)[]>
  style: Map<string, (string | number)[]>
  keys: string[]
  nodes: NodeInterface[]
}

export interface EditableInterface {

  readonly isComposition: boolean

  isBlock(node: NodeInterface): boolean;

  isInline(node: NodeInterface): boolean;

  isVoid(node: NodeInterface): boolean;

  getKey:() => NodeKey

  getRange(): RangeInterface | null

  getSelection(): SelectionInterface

  getModel(): ModelInterface

  deleteBackward(): void

  deleteForward(): void

  deleteContents(): void

  insertText(text: string): void;

  insertNode(node: NodeInterface): void

  setFormat(name: string, value: string | number): void

  deleteFormat(name: string): void

  queryState(): ActiveState

  queryFormat(callback: (name: string, value: (string | number)[]) => boolean): boolean

  queryStyle(callback: (name: string, value: (string | number)[]) => boolean): boolean

  queryKey(callback: (key: string) => boolean): boolean

  queryNode(callback: (node: NodeInterface) => boolean): boolean

  onChange(node: NodeInterface, ops: Op[]): void

  onKeydown(event: KeyboardEvent): void

  onKeyup(event: KeyboardEvent): void

  onInput(event: InputEvent): void

  onCompositionStart(event: CompositionEvent): void

  onCompositionEnd(event: CompositionEvent): void

  onInput(event: InputEvent): void

  onFocus(): void

  onBlur(): void

  onSelectStart(): void

  onSelecting(): void

  onSelectEnd(): void

  onSelectChange(): void
}