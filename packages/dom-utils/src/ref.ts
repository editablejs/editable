
export interface RefObject<T> {
  current: T;
}

function createRef<T>(initialValue: T): RefObject<T>;
function createRef<T>(initialValue: T | null): RefObject<T | null>
function createRef<T = undefined>(): RefObject<T | undefined>
function createRef<T = undefined>(initialValue: T | undefined = undefined): RefObject<T | undefined> {
  const ref = {
    current: initialValue
  }

  return ref
}

export { createRef }
