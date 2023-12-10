import { Hook } from './hook'
import { setCurrent, clear } from './interface'
import { hookSymbol, effectsSymbol, layoutEffectsSymbol, EffectsSymbols } from './symbols'
import { isFunction } from './utils'

export interface Callable {
  call: (state: State) => void
}

export interface State<H = unknown> {
  update: VoidFunction
  host: H
  virtual?: boolean
  [hookSymbol]: Map<number, Hook>
  [effectsSymbol]: Callable[]
  [layoutEffectsSymbol]: Callable[]
  run<T>(cb: () => T): T
  _runEffects(phase: EffectsSymbols): void
  runEffects(): void
  runLayoutEffects(): void
  teardown(): void
}

export const createState = <H = unknown>(update: VoidFunction, host: H): State<H> => {
  const _runEffects = (phase: EffectsSymbols): void => {
    let effects = state[phase]
    setCurrent(state)
    for (let effect of effects) {
      effect.call(state)
    }
    clear()
  }

  const state: State<H> = {
    update,
    host,
    [hookSymbol]: new Map(),
    [effectsSymbol]: [],
    [layoutEffectsSymbol]: [],
    run<T>(cb: () => T): T {
      setCurrent(state)
      let res = cb()
      clear()
      return res
    },
    _runEffects,
    runEffects(): void {
      _runEffects(effectsSymbol)
    },

    runLayoutEffects(): void {
      _runEffects(layoutEffectsSymbol)
    },

    teardown(): void {
      let hooks = state[hookSymbol]
      hooks.forEach(hook => {
        if (isFunction(hook.teardown)) {
          hook.teardown()
        }
      })
    },
  }

  return state
}
