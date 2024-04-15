import { DOMNode } from "./is-dom-node";

export interface RefObject<T extends DOMNode | null | undefined> {
  current: T;
}

function createRef<T extends DOMNode>(initialValue: T): RefObject<T>;
function createRef<T extends DOMNode>(initialValue: T | null): RefObject<T | null>
function createRef<T extends DOMNode | undefined = undefined>(): RefObject<T | undefined>
function createRef<T extends DOMNode | undefined = undefined>(initialValue: T | undefined = undefined): RefObject<T | undefined> {
  const ref = {
    current: initialValue
  }

  return ref
}

export { createRef }
