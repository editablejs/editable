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
}

export interface IRange {
  readonly ahchor: Position
  readonly focus: Position
  readonly isCollapsed: boolean

  getClientRects(): DOMRectList | null
}

export interface RangeOptions { 
  anchor: Position
  focus: Position
}

export interface ISelectionLayer {
  draw(...ranges: IRange[]): void
}