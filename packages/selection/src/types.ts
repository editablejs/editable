import type { IEventEmitter } from "@editablejs/event-emitter";
import type { IModel, NodeKey } from '@editablejs/model';

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
  readonly anchor: Position | null;
  readonly focus: Position | null;
  readonly isCollapsed: boolean;
  readonly isFocus: boolean;
  
  getRangeAt(index: number): IRange | null;

  getRangeCount(): number;

  addRange(range: IRange): void;

  removeRangeAt(index: number): void;

  removeAllRange(): void;
  
  applyRange(range: IRange): void;

  drawRanges(...ranges: IRange[]): void

  moveTo(key: NodeKey, offset: number): void

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

  clone(): IRange

  collapse(start: boolean): void
}

export interface IDrawRange extends IRange {
  color?: string
  width?: number
}

export interface RangeOptions { 
  anchor: Position
  focus?: Position
}

export interface LayerPosition {
  left: number
  top: number
  width: number
  height: number
  color?: string
}

export interface ILayer {

  getBody(): HTMLElement

  draw(...ranges: IRange[]): void

  drawRange(range: IRange): void

  createBox(key: NodeKey, position: LayerPosition): HTMLDivElement

  updateBox(box: HTMLDivElement, position: LayerPosition): HTMLDivElement

  drawCaret(position: LayerPosition): void
  
  drawLines(...position: LayerPosition[]): void

  setCaretState(state: boolean): void

  clear(...keys: string[]): void

  clearCaret(): void

  clearSelection(): void

  appendChild(child: HTMLElement): void

  destroy(): void
}

export interface IInput extends IEventEmitter {
  
  bindContainers(...containers: HTMLElement[]): void

  focus(): void

  blur(): void

  render(range: IRange): void

  destroy(): void

}

export interface ITyping extends IEventEmitter {

  bindContainers(...containers: HTMLElement[]): void

  destroy(): void
}

export interface TypingOptions {
  model: IModel
}