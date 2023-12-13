// eslint-disable-next-line import/extensions
import { useSyncExternalStoreWithSelector } from './use-sync-external-store-with-selector'
import { createStore } from './vanilla'
import type { Mutate, StateCreator, StoreApi, StoreMutatorIdentifier } from './vanilla.ts'

type ExtractState<S> = S extends { getState: () => infer T } ? T : never

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'subscribe'>

type WithReact<S extends ReadonlyStoreApi<unknown>> = S & {
  getServerState?: () => ExtractState<S>
}

export function useStoreWithEqualityFn<S extends WithReact<StoreApi<unknown>>>(
  api: S,
): ExtractState<S>

export function useStoreWithEqualityFn<S extends WithReact<StoreApi<unknown>>, U>(
  api: S,
  selector: (state: ExtractState<S>) => U,
  equalityFn?: (a: U, b: U) => boolean,
): U

export function useStoreWithEqualityFn<TState, StateSlice>(
  api: WithReact<StoreApi<TState>>,
  selector: (state: TState) => StateSlice = api.getState as any,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean,
) {
  const slice = useSyncExternalStoreWithSelector(api.subscribe, api.getState, selector, equalityFn)
  return slice
}

export type UseBoundStoreWithEqualityFn<S extends WithReact<ReadonlyStoreApi<unknown>>> = {
  (): ExtractState<S>
  <U>(selector: (state: ExtractState<S>) => U, equalityFn?: (a: U, b: U) => boolean): U
} & S

type CreateWithEqualityFn = {
  <T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>,
    defaultEqualityFn?: <U>(a: U, b: U) => boolean,
  ): UseBoundStoreWithEqualityFn<Mutate<StoreApi<T>, Mos>>
  <T>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>,
    defaultEqualityFn?: <U>(a: U, b: U) => boolean,
  ) => UseBoundStoreWithEqualityFn<Mutate<StoreApi<T>, Mos>>
}

const createWithEqualityFnImpl = <T>(
  createState: StateCreator<T, [], []>,
  defaultEqualityFn?: <U>(a: U, b: U) => boolean,
) => {
  const api = createStore(createState)

  const useBoundStoreWithEqualityFn: any = (selector?: any, equalityFn = defaultEqualityFn) =>
    useStoreWithEqualityFn(api, selector, equalityFn)

  Object.assign(useBoundStoreWithEqualityFn, api)

  return useBoundStoreWithEqualityFn
}

export const createWithEqualityFn = (<T>(
  createState: StateCreator<T, [], []> | undefined,
  defaultEqualityFn?: <U>(a: U, b: U) => boolean,
) =>
  createState
    ? createWithEqualityFnImpl(createState, defaultEqualityFn)
    : createWithEqualityFnImpl) as CreateWithEqualityFn
