import type { IEventEmitter } from "@editablejs/event-emitter";
import type { IModel, INode, NodeKey, Op } from '@editablejs/model';

export interface Position {
  key: NodeKey;
  offset: number
}

export interface SelectionOptions {
  model: IModel
  blurColor?: string
  focusColor?: string
  caretColor?: string
  caretWidth?: number
}

/**
 * Selection
 */
export interface ISelection extends IEventEmitter {
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

  getSubRanges(...ranges: IRange[]): IRange[]

  getContents(...ranges: IRange[]): INode[]
  
  getRangeAt(index: number): IRange | null;

  getRangeCount(): number;

  addRange(range: IRange): void;

  removeRangeAt(index: number): void;

  removeAllRange(): void;
  
  applyRange(range: IRange): void;

  applyFromOps(ops: Op[]): void;

  drawByRanges(...ranges: IRange[]): void

  drawCaretByRect(rect: Omit<DrawRect, 'color'> & Record<'color', string | undefined>): void
 
  drawBlocksByRects(...rects: (Omit<DrawRect, 'color'> & Record<'color', string | undefined>)[]): void

  clearSelection(): void

  moveTo(key: NodeKey, offset: number): ISelection

  moveAnchorTo(key: NodeKey, offset: number): ISelection

  moveFocusTo(key: NodeKey, offset: number): ISelection

  moveToForward(): ISelection

  moveToBackward(): ISelection

  moveAnchorToForward(): ISelection

  moveFocusToForward(): ISelection

  moveAnchorToBackward(): ISelection

  moveFocusToBackward(): ISelection

  destroy(): void
}

export interface IRange {
  readonly anchor: Position
  readonly focus: Position
  readonly isCollapsed: boolean
  readonly isBackward: boolean

  setStart(key: NodeKey, offset: number): void

  setEnd(key: NodeKey, offset: number): void

  getClientRects(): DOMRectList | null

  collapse(start: boolean): void

  clone(): IRange

  equal(range: IRange): boolean
}

export interface RangeOptions { 
  anchor: Position
  focus?: Position
}

export interface DrawRect {
  left: number
  top: number
  width: number
  height: number
  color: string
}

export interface ILayer {

  getBody(): HTMLElement

  createBox(key: NodeKey, rect: Partial<DrawRect>, styles?: Partial<CSSStyleDeclaration>): HTMLDivElement

  updateBox(box: HTMLDivElement, rect: Partial<DrawRect>, styles?: Partial<CSSStyleDeclaration>): HTMLDivElement

  drawCaret(rect: DrawRect): void
  
  drawBlocks(...rects: DrawRect[]): void

  setCaretState(state: boolean): void

  clear(...keys: string[]): void

  clearCaret(): void

  clearSelection(): void

  appendChild(child: HTMLElement): void

  destroy(): void
}

export interface IInput extends IEventEmitter {

  readonly isComposing: boolean
  
  updateContainers(containers: Map<string, HTMLElement>): void

  focus(): void

  blur(): void

  render(rect: Omit<DrawRect, 'color'>): void

  destroy(): void

}

export interface ITyping extends IEventEmitter {
  startMutationRoot(): void
  stopMutationRoot(): void
  destroy(): void
}

export interface TypingOptions {
  model: IModel
}