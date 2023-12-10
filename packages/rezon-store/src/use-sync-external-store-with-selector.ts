import { useEffect, useMemo, useRef } from "rezon";
import { useSyncExternalStore } from "./use-sync-external-store";


interface Instance<S> {
  hasValue: boolean,
  value: S | null,
}

export const useSyncExternalStoreWithSelector = <T, S> (
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  selector: (snapshot: T) => S
): S => {
  const instRef = useRef<Instance<S> | null>(null);
  let inst: Instance<S>;
  if (instRef.current === null) {
    inst = {
      hasValue: false,
      value: null,
    };
    instRef.current = inst;
  } else {
    inst = instRef.current;
  }


  const [getSelection] = useMemo(() => {
    let hasMemo = false;
    let memoizedSnapshot: T;
    let memoizedSelection: S;
    const memoizedSelector = (nextSnapshot: T) => {
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;
        const nextSelection = selector(nextSnapshot);
        memoizedSelection = nextSelection;
        return nextSelection;
      }

      const prevSnapshot: T = memoizedSnapshot;
      const prevSelection: S = memoizedSelection;

      if (Object.is(prevSnapshot, nextSnapshot)) {
        return prevSelection;
      }

      const nextSelection = selector(nextSnapshot);

      memoizedSnapshot = nextSnapshot;
      memoizedSelection = nextSelection;
      return nextSelection;
    };

    const getSnapshotWithSelector = () => memoizedSelector(getSnapshot());

    return [getSnapshotWithSelector];
  }, [getSnapshot, selector]);

  const value = useSyncExternalStore(
    subscribe,
    getSelection,
  );

  useEffect(() => {
    inst.hasValue = true;
    inst.value = value;
  }, [value]);

  return value;
}
