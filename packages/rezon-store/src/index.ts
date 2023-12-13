import { useSyncExternalStoreWithSelector } from './use-sync-external-store-with-selector'
import { createStore } from './vanilla.js'
import type { Mutate, StateCreator, StoreApi, StoreMutatorIdentifier } from './vanilla.js'

type ExtractState<S> = S extends { getState: () => infer T } ? T : never

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'subscribe'>

type WithRezon<S extends ReadonlyStoreApi<unknown>> = S & {
  getServerState?: () => ExtractState<S>
}

export function useStore<S extends WithRezon<StoreApi<unknown>>>(api: S): ExtractState<S>
export function useStore<S extends WithRezon<StoreApi<unknown>>, U>(
  api: S,
  selector: (state: ExtractState<S>) => U,
): U
export function useStore<TState, StateSlice>(
  api: WithRezon<StoreApi<TState>>,
  selector: (state: TState) => StateSlice = api.getState as any,
) {
  const slice = useSyncExternalStoreWithSelector(api.subscribe, api.getState, selector)
  return slice
}

export type UseBoundStore<S extends WithRezon<ReadonlyStoreApi<unknown>>> = {
  (): ExtractState<S>
  <U>(selector: (state: ExtractState<S>) => U): U
} & S

type Create = {
  <T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>,
  ): UseBoundStore<Mutate<StoreApi<T>, Mos>>
  <T>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>,
  ) => UseBoundStore<Mutate<StoreApi<T>, Mos>>
}

const createImpl = <T>(createState: StateCreator<T, [], []>) => {
  const api = typeof createState === 'function' ? createStore(createState) : createState

  const useBoundStore: any = (selector?: any, equalityFn?: any) => useStore(api, selector)

  Object.assign(useBoundStore, api)

  return useBoundStore
}

export const create = (<T>(createState: StateCreator<T, [], []> | undefined) =>
  createState ? createImpl(createState) : createImpl) as Create

export { StoreApi }
