import { CreateHook, hook, Hook } from './hook';
import { State } from './state';

export type Reducer<S, A> = (prevState: S, action: A) => S;
export type Dispatch<A> = (action: A) => void

const create = <S, I, A>() => {
  const _create: CreateHook<[Reducer<S, A>, I, ((init: I) => S)?], readonly [S, Dispatch<A>]> = (
    id: number,
    state: State,
    _reducer: Reducer<S, A>,
    initialState: I,
    init?: (init: I) => S,
  ) => {
    let currentState = init !== undefined ? init(initialState) : <S><any>initialState;
    let reducer: Reducer<S, A> = _reducer

    const dispatch = (action: A): void => {
      currentState = reducer(currentState, action);
      hook.state.update();
    }

    const hook: Hook<[Reducer<S, A>, I, ((init: I) => S)?], readonly [S, Dispatch<A>]> = {
      id,
      state,
      update: (_reducer: Reducer<S, A>): readonly [S, Dispatch<A>] => {
        reducer = _reducer;
        return [currentState, dispatch];
      },
    }

    return hook
  }

  return _create
}

export function useReducer<S, A>(reducer: Reducer<S, A>, initialState: S): readonly [S, Dispatch<A>];
export function useReducer<S, I, A>(reducer: Reducer<S, A>, initialState: I, init?: (init: I) => S): readonly [S, Dispatch<A>] {
  return hook(create<S, I, A>())(reducer, initialState, init)
}
