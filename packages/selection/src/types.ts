import type EventEmitter from "eventemitter3";

export interface SelectionOptions {
  container: HTMLElement;
}

/**
 * Selection
 */
export interface ISelection extends EventEmitter {
  readonly anchorNode: Text | null;
  readonly anchorOffset: number;
  readonly focusNode: Text | null;
  readonly focusOffset: number;
}
