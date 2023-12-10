import { CreateHook, hook, Hook } from './hook'
import { State } from './state'

const create = <T>() => {
  const _create: CreateHook<[() => T, unknown[]], T, unknown> = (
    id: number,
    state: State,
    fn: () => T,
    _values: unknown[],
  ) => {
    let value: T = fn()
    let values: unknown[] = _values

    const hasChanged = (_values: unknown[] = []): boolean => {
      return _values.some((value, i) => values[i] !== value)
    }

    const hook: Hook<[() => T, unknown[]], T, unknown> = {
      id,
      state,
      update: (fn: () => T, _values: unknown[]) => {
        if (hasChanged(_values)) {
          values = _values
          value = fn()
        }
        return value
      },
    }
    return hook
  }
  return _create
}

/**
 * @function
 * @template T
 * @param  {() => T} fn function to memoize
 * @param  {unknown[]} values dependencies to the memoized computation
 * @return {T} The next computed value
 */
const useMemo = <T>(fn: () => T, values: unknown[]): T => {
  return hook(create<T>())(fn, values)
}

export { useMemo }
