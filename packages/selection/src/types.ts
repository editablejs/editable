import type EventEmitter from "eventemitter3";

export interface Position {
  key: string;
  offset: number
}

export interface SelectionOptions {
  container: HTMLElement;
}

/**
 * Selection
 */
export interface ISelection extends EventEmitter {
  readonly anchor: Position | null;
  readonly focus: Position | null;
  readonly isCollapsed: boolean;
  
  getRangeAt(index: number): IRange | null;

  getRangeCount(): number;

  addRange(range: IRange): void;

  removeRangeAt(index: number): void;

  removeAllRange(): void;

  destroy(): void
}

export interface IRange {
  readonly anchor: Position
  readonly focus: Position
  readonly isCollapsed: boolean
  readonly isBackward: boolean

  getClientRects(): DOMRectList | null

  clone(): IRange

  collapse(start: boolean): void
}

export interface RangeOptions { 
  anchor: Position
  focus: Position
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

  createBox(key: string, position: LayerPosition): HTMLDivElement

  updateBox(box: HTMLDivElement, position: LayerPosition): HTMLDivElement

  drawCaret(position: LayerPosition): void
  
  drawLines(...position: LayerPosition[]): void

  setCaretState(state: boolean): void

  clear(...keys: string[]): void

  appendChild(child: HTMLElement): void

  destroy(): void
}

export interface IInput extends EventEmitter {

  render(range: IRange): void

  destroy(): void

}