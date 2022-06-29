import type { NodeInterface, NodeKey, Op } from '@editablejs/model';
import { Position, RangeInterface } from "./range";

/**
 * Selection
 */
 export interface SelectionInterface {
  /**
   * 锚点，返回当前选区的起始位置
   */
  readonly anchor: Position | null;
  /**
   * 焦点，返回当前选区的终点位置
   */
  readonly focus: Position | null;
  /**
   * 返回当前选区的起始位置和终点位置是否重合
   */
  readonly isCollapsed: boolean;
  /**
   * 返回当前是否聚焦
   */
  readonly isFocus: boolean;

  onKeydown(event: KeyboardEvent): void

  onKeyup(event: KeyboardEvent): void

  onCompositionStart(event: CompositionEvent): void

  onCompositionEnd(event: CompositionEvent): void

  onInput(event: InputEvent): void

  onFocus(): void

  onBlur(): void

  getSubRanges(...ranges: RangeInterface[]): RangeInterface[]

  getContents(...ranges: RangeInterface[]): NodeInterface[]
  
  getRangeAt(index: number): RangeInterface | null;

  getRangeCount(): number;

  addRange(range: RangeInterface): void;

  removeRangeAt(index: number): void;

  removeAllRange(): void;

  onSelectStart(): void

  onSelecting(): void

  onSelectEnd(): void

  onSelectChange(): void
  
  applyRange(range: RangeInterface): void;

  applyOps(ops: Op[]): void;

  moveTo(key: NodeKey, offset: number): SelectionInterface

  moveAnchorTo(key: NodeKey, offset: number): SelectionInterface

  moveFocusTo(key: NodeKey, offset: number): SelectionInterface

  moveToForward(): SelectionInterface

  moveToBackward(): SelectionInterface

  moveAnchorToForward(): SelectionInterface

  moveFocusToForward(): SelectionInterface

  moveAnchorToBackward(): SelectionInterface

  moveFocusToBackward(): SelectionInterface
}



