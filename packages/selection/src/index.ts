import EventEmitter from "eventemitter3";
import type { ISelection, SelectionOptions } from "./types";

export default class Selection extends EventEmitter implements ISelection {
  options: SelectionOptions;
  readonly anchorNode: Text | null = null;
  readonly anchorOffset: number = 0;
  readonly focusNode: Text | null = null;
  readonly focusOffset: number = 0;

  constructor(options: SelectionOptions) {
    super();
    this.options = options;
    const { container } = options
    container.addEventListener('mousedown', this.onMouseDown);
  }

  onMouseDown = (e: MouseEvent) => { 
    if (!e.target) return
    const targetNode = e.target as Node
    if (targetNode instanceof Text) {
      
    }
  }
}
