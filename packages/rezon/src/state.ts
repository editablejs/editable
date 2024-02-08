import { Hook } from './hook'
import { BatchId, runWithCurrent } from './interface'
import { effectsSymbol, layoutEffectsSymbol, EffectsSymbols } from './symbols'
import { isFunction } from './utils'

export interface Callable {
  call: (state: State) => void
}

export interface StateUpdateOptions {
  force?: boolean
  batchId?: BatchId
}

export type StateUpdate = (options?: StateUpdateOptions) => void

export interface State<H = unknown> {
  update: StateUpdate
  host: H
  run<T>(cb: () => T): T
  runEffects(phase?: EffectsSymbols): void
  teardown(): void
}

const STATE_TO_HOOKS_WEAK_MAP = new WeakMap<State, Map<number, Hook>>()

export const getHooks = (state: State): Map<number, Hook> => {
  let hooks = STATE_TO_HOOKS_WEAK_MAP.get(state)
  if (!hooks) {
    hooks = new Map()
    STATE_TO_HOOKS_WEAK_MAP.set(state, hooks)
  }
  return hooks
}

export const setHooks = (state: State, hooks: Map<number, Hook>): void => {
  STATE_TO_HOOKS_WEAK_MAP.set(state, hooks)
}

const STATE_TO_EFFECTS_WEAK_MAP = new WeakMap<State, Callable[]>()
const STATE_TO_LAYOUT_EFFECTS_WEAK_MAP = new WeakMap<State, Callable[]>()

const getEffectsWeakMap = (phase: EffectsSymbols): WeakMap<State, Callable[]> => {
  return phase === layoutEffectsSymbol ? STATE_TO_LAYOUT_EFFECTS_WEAK_MAP : STATE_TO_EFFECTS_WEAK_MAP
}

export const getEffects = (state: State, phase: EffectsSymbols): Callable[] => {
  const weakMap = getEffectsWeakMap(phase)
  let effects = weakMap.get(state)
  if (!effects) {
    effects = []
    weakMap.set(state, effects)
  }
  return effects
}

export const pushEffects = (state: State, effect: Callable, phase: EffectsSymbols): void => {
  const effects = getEffects(state, phase)
  effects.push(effect)
}

export const createState = <H = unknown>(update: StateUpdate, host: H): State<H> => {
  const state: State<H> = {
    update,
    host,
    run<T>(cb: () => T): T {
      return runWithCurrent(state, cb)
    },
    runEffects(phase: EffectsSymbols = effectsSymbol): void {
      runWithCurrent(state, () => {
        const effects = getEffects(state, phase)
        for (let effect of effects) {
          effect.call(state)
        }
      })
    },

    teardown(): void {
      const hooks = getHooks(state)
      hooks.forEach(hook => {
        if (isFunction(hook.teardown)) {
          hook.teardown()
        }
      })
    },
  }

  return state
}
