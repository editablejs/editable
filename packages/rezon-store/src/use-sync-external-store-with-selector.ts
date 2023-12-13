import { useEffect, useMemo, useRef } from 'rezon'
import { useSyncExternalStore } from './use-sync-external-store'

interface Instance<S> {
  hasValue: boolean
  value: S | null
}

export const useSyncExternalStoreWithSelector = <T, S>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  selector: (snapshot: T) => S,
  isEqual?: (a: S, b: S) => boolean,
): S => {
  const instRef = useRef<Instance<S> | null>(null)
  let inst: Instance<S>
  if (instRef.current === null) {
    inst = {
      hasValue: false,
      value: null,
    }
    instRef.current = inst
  } else {
    inst = instRef.current
  }

  const [getSelection] = useMemo(() => {
    let hasMemo = false
    let memoizedSnapshot: T
    let memoizedSelection: S
    const memoizedSelector = (nextSnapshot: T) => {
      if (!hasMemo) {
        hasMemo = true
        memoizedSnapshot = nextSnapshot
        const nextSelection = selector(nextSnapshot)
        if (isEqual !== undefined) {
          // Even if the selector has changed, the currently rendered selection
          // may be equal to the new selection. We should attempt to reuse the
          // current value if possible, to preserve downstream memoizations.
          if (inst.hasValue) {
            const currentSelection = inst.value!
            if (isEqual(currentSelection, nextSelection)) {
              memoizedSelection = currentSelection
              return currentSelection
            }
          }
        }
        memoizedSelection = nextSelection
        return nextSelection
      }

      const prevSnapshot: T = memoizedSnapshot
      const prevSelection: S = memoizedSelection

      if (Object.is(prevSnapshot, nextSnapshot)) {
        return prevSelection
      }

      const nextSelection = selector(nextSnapshot)
      if (isEqual !== undefined && isEqual(prevSelection, nextSelection)) {
        return prevSelection
      }

      memoizedSnapshot = nextSnapshot
      memoizedSelection = nextSelection
      return nextSelection
    }

    const getSnapshotWithSelector = () => memoizedSelector(getSnapshot())

    return [getSnapshotWithSelector]
  }, [getSnapshot, selector, isEqual])

  const value = useSyncExternalStore(subscribe, getSelection)

  useEffect(() => {
    inst.hasValue = true
    inst.value = value
  }, [value])

  return value
}
