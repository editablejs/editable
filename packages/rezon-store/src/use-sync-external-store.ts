import { useEffect, useLayoutEffect, useState } from 'rezon'

export const useSyncExternalStore = <T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
): T => {
  const value = getSnapshot()
  const [{ inst }, forceUpdate] = useState({ inst: { value, getSnapshot } })

  useLayoutEffect(() => {
    inst.value = value
    inst.getSnapshot = getSnapshot

    if (checkIfSnapshotChanged(inst)) {
      // Force a re-render.
      forceUpdate({ inst })
    }
  }, [subscribe, value, getSnapshot])

  useEffect(() => {
    if (checkIfSnapshotChanged(inst)) {
      forceUpdate({ inst })
    }
    const handleStoreChange = () => {
      if (checkIfSnapshotChanged(inst)) {
        forceUpdate({ inst })
      }
    }
    return subscribe(handleStoreChange)
  }, [subscribe])

  return value
}

function checkIfSnapshotChanged<T>(inst: { value: T; getSnapshot: () => T }): boolean {
  const latestGetSnapshot = inst.getSnapshot
  const prevValue = inst.value
  try {
    const nextValue = latestGetSnapshot()
    return !Object.is(prevValue, nextValue)
  } catch (error) {
    return true
  }
}
