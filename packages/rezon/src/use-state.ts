import { CreateHook, hook, Hook } from './hook'
import { State } from './state'
import { isFunction } from './utils'

export type StateUpdater<S> = (value: S | ((prevState: S) => S)) => void
export type SetStateAction<S> = S | ((prevState: S) => S)

const create = <T>() => {
  const _create: CreateHook<[T], readonly [T, StateUpdater<T>]> = (
    id: number,
    state: State,
    initialValue: T,
  ) => {
    let args: readonly [T, StateUpdater<T>]

    if (isFunction(initialValue)) {
      initialValue = initialValue()
    }

    const updater = (value: SetStateAction<T>): void => {
      const [previousValue] = args
      if (isFunction(value)) {
        const updaterFn = value as (previousState?: T) => T
        value = updaterFn(previousValue)
      }

      if (Object.is(previousValue, value)) {
        return
      }

      makeArgs(value)
      state.update(true)
    }

    const makeArgs = (value: T): void => {
      args = Object.freeze([value, updater] as const)
    }

    makeArgs(initialValue)

    const hook: Hook<[T], readonly [T, StateUpdater<T>]> = {
      id,
      state,
      update: () => {
        return args
      },
    }

    return hook
  }

  return _create
}

export function useState<S>(initialState: S | (() => S)): readonly [S, StateUpdater<S>]
export function useState<S = undefined>(): readonly [S | undefined, StateUpdater<S | undefined>]
export function useState<S = undefined>(
  initialState: S | undefined = undefined,
): readonly [S | undefined, StateUpdater<S | undefined>] {
  // @ts-ignore
  return hook(create<S>())(initialState)
}
