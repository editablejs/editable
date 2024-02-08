import { StateUpdateOptions, State, createState } from './state'
import {
  commitSymbol,
  phaseSymbol,
  updateSymbol,
  effectsSymbol,
  Phase,
  layoutEffectsSymbol,
  EffectsSymbols,
} from './symbols'
import { ChildPart, noChange } from './lit-html/html'
import {
  BatchId,
  RootStateMap,
  createBatchId,
  createRootStateMap,
  createTaskQueue,
  isFlushing,
  setFlushing,
} from './interface'

export const flushSync = (cb: VoidFunction) => {
  setFlushing(true)
  cb()
  setFlushing(false)
}

const read = createTaskQueue()
const write = createTaskQueue()

export interface SchedulerUpdateOptions extends StateUpdateOptions {
  state?: State<unknown>
}

export interface Scheduler<
  H = ChildPart,
> {
  state: State<H>
  update(options?: SchedulerUpdateOptions): void
  render(options?: SchedulerUpdateOptions): unknown
  commit(result: unknown, options?: SchedulerUpdateOptions): void
  teardown(): void
}

const handleEffects = (
  batchId: BatchId,
  state: State,
  phase: EffectsSymbols,
  run: (phase: EffectsSymbols, noChange?: boolean) => void,
  noChange = false,
) => {
  const children = getChildrenFromStateMap(batchId, phase, state)
  addEffectsToStateMap(batchId, phase, state, () => run(phase, noChange))
  if (!children || children.size === 0) {
    finishStateMap(batchId, phase, state)
  }
}

const BATCHID_TO_ROOTSTATE_WEAKMAP: WeakMap<BatchId, RootStateMap> = new WeakMap()

const BATCHID_TO_STATE_WEAKMAP: WeakMap<
  BatchId,
  WeakMap<EffectsSymbols, WeakMap<State, Map<State, boolean>>>
> = new WeakMap()

const BATCHID_TO_STATE_PARENT_WEAKMAP: WeakMap<
  BatchId,
  WeakMap<EffectsSymbols, WeakMap<State, State>>
> = new WeakMap()

const BATCHID_TO_EFFECTS_WEAKMAP: WeakMap<
  BatchId,
  WeakMap<EffectsSymbols, WeakMap<State, VoidFunction[]>>
> = new WeakMap()

const getStateMapFromBatchId = (batchId: BatchId, effectsSymbols: EffectsSymbols) => {
  let batchIdToState = BATCHID_TO_STATE_WEAKMAP.get(batchId)
  if (!batchIdToState) {
    batchIdToState = new WeakMap()
    BATCHID_TO_STATE_WEAKMAP.set(batchId, batchIdToState)
  }
  let effectsToState = batchIdToState.get(effectsSymbols)
  if (!effectsToState) {
    effectsToState = new WeakMap()
    batchIdToState.set(effectsSymbols, effectsToState)
  }
  return effectsToState
}

const getStateParentMapFromBatchId = (batchId: BatchId, effectsSymbols: EffectsSymbols) => {
  let batchIdToState = BATCHID_TO_STATE_PARENT_WEAKMAP.get(batchId)
  if (!batchIdToState) {
    batchIdToState = new WeakMap()
    BATCHID_TO_STATE_PARENT_WEAKMAP.set(batchId, batchIdToState)
  }
  let effectsToState = batchIdToState.get(effectsSymbols)
  if (!effectsToState) {
    effectsToState = new WeakMap()
    batchIdToState.set(effectsSymbols, effectsToState)
  }
  return effectsToState
}

const deleteStateMapFromBatchId = (batchId: BatchId, effectsSymbols: EffectsSymbols) => {
  const batchIdToState = BATCHID_TO_STATE_WEAKMAP.get(batchId)
  if (batchIdToState) {
    batchIdToState.delete(effectsSymbols)
  }
}

const deleteStateParentMapFromBatchId = (batchId: BatchId, effectsSymbols: EffectsSymbols) => {
  const batchIdToState = BATCHID_TO_STATE_PARENT_WEAKMAP.get(batchId)
  if (batchIdToState) {
    batchIdToState.delete(effectsSymbols)
  }
}

const addChildrenToStateMap = (
  batchId: BatchId,
  effectsSymbols: EffectsSymbols,
  state: State,
  child: State,
) => {
  const stateMap = getStateMapFromBatchId(batchId, effectsSymbols)
  let children = stateMap.get(state)
  if (!children) {
    children = new Map()
    stateMap.set(state, children)
  }
  children.set(child, false)
  const stateParentMap = getStateParentMapFromBatchId(batchId, effectsSymbols)
  if (!stateParentMap.has(child)) {
    stateParentMap.set(child, state)
  }
}

const getChildrenFromStateMap = (
  batchId: BatchId,
  effectsSymbols: EffectsSymbols,
  state: State,
) => {
  const stateMap = getStateMapFromBatchId(batchId, effectsSymbols)
  return stateMap.get(state)
}

const deleteChildrenFromStateMap = (
  batchId: BatchId,
  effectsSymbols: EffectsSymbols,
  parent: State,
  state: State,
) => {
  const stateMap = getStateMapFromBatchId(batchId, effectsSymbols)
  const children = stateMap.get(parent)
  if (children) {
    children.delete(state)
  }
}

const deleteParentFromStateMap = (
  batchId: BatchId,
  effectsSymbols: EffectsSymbols,
  state: State,
) => {
  const parentMap = getStateParentMapFromBatchId(batchId, effectsSymbols)
  parentMap.delete(state)
}

const getEffectsFromStateMap = (batchId: BatchId, effectsSymbols: EffectsSymbols, state: State) => {
  let batchIdToEffects = BATCHID_TO_EFFECTS_WEAKMAP.get(batchId)
  if (!batchIdToEffects) {
    batchIdToEffects = new WeakMap()
    BATCHID_TO_EFFECTS_WEAKMAP.set(batchId, batchIdToEffects)
  }
  let effects = batchIdToEffects.get(effectsSymbols)
  if (!effects) {
    effects = new WeakMap()
    batchIdToEffects.set(effectsSymbols, effects)
  }
  let stateToEffects = effects.get(state)
  if (!stateToEffects) {
    stateToEffects = []
    effects.set(state, stateToEffects)
  }
  return stateToEffects
}

const addEffectsToStateMap = (
  batchId: BatchId,
  effectsSymbols: EffectsSymbols,
  state: State,
  effect: VoidFunction,
) => {
  const effects = getEffectsFromStateMap(batchId, effectsSymbols, state)
  effects.push(effect)
}

const deleteEffectsFromStateMap = (
  batchId: BatchId,
  effectsSymbols: EffectsSymbols,
  state: State,
) => {
  const batchIdToEffects = BATCHID_TO_EFFECTS_WEAKMAP.get(batchId)
  if (batchIdToEffects) {
    const effects = batchIdToEffects.get(effectsSymbols)
    if (effects) {
      effects.delete(state)
    }
  }
}

const finishStateMap = (batchId: BatchId, effectsSymbols: EffectsSymbols, state: State) => {
  const parentState = getStateParentMapFromBatchId(batchId, effectsSymbols).get(state)
  if (!parentState) {
    const rootStateMap = BATCHID_TO_ROOTSTATE_WEAKMAP.get(batchId)
    if (rootStateMap) {
      let allFinished = true
      for (const [rootState, value] of rootStateMap) {
        if (rootState === state) {
          value[effectsSymbols] = true
          if (!allFinished) break
        } else {
          allFinished = allFinished && value[effectsSymbols]
        }
      }
      if (allFinished) {
        for (const [rootState] of rootStateMap) {
          const effects = getEffectsFromStateMap(batchId, effectsSymbols, rootState)
          for (const effect of effects) {
            effect()
          }
          deleteEffectsFromStateMap(batchId, effectsSymbols, rootState)
        }
        deleteStateMapFromBatchId(batchId, effectsSymbols)
        deleteStateParentMapFromBatchId(batchId, effectsSymbols)
        BATCHID_TO_ROOTSTATE_WEAKMAP.delete(batchId)
      } else {
        for (const [_, value] of rootStateMap) {
          if (!value.started) {
            value.started = true
            value.run()
            break
          }
        }
      }
    }
    return
  }
  const children = getChildrenFromStateMap(batchId, effectsSymbols, parentState)
  if (children) {
    let allFinished = true
    for (const [child, finish] of children) {
      if (child === state) {
        children.set(child, true)
        if (!allFinished) break
      } else {
        allFinished = allFinished && finish
      }
    }
    if (allFinished) {
      const effects = getEffectsFromStateMap(batchId, effectsSymbols, parentState)
      for (const [child] of children) {
        const childEffects = getEffectsFromStateMap(batchId, effectsSymbols, child)
        effects.unshift(...childEffects)
        deleteEffectsFromStateMap(batchId, effectsSymbols, child)
        deleteChildrenFromStateMap(batchId, effectsSymbols, parentState, child)
        deleteParentFromStateMap(batchId, effectsSymbols, child)
      }
      finishStateMap(batchId, effectsSymbols, parentState)
    }
  }
}

const BATCH_TO_RUNNING_WEAK_MAP = new WeakMap<BatchId, boolean>()
const BATCH_UPDATED_STATES_WEAK_MAP = new WeakMap<BatchId, Set<State>>()
export const createScheduler = <
  H = ChildPart,
  T extends Scheduler<H> = Scheduler<H>,
>(
  host: H,
): T => {
  const handlePhase = (phase: Phase, arg?: unknown, options: SchedulerUpdateOptions = {}) => {
    switch (phase) {
      case commitSymbol:
        scheduler.commit(arg, options)
        return handleEffects(options.batchId!, state, layoutEffectsSymbol, runEffects, arg === noChange)
      case updateSymbol:
        return scheduler.render(options)
      case effectsSymbol:
        return handleEffects(options.batchId!, state, effectsSymbol, runEffects, arg === noChange)
    }
  }
  let _updateQueued = false
  let _updateForce = false
  const update = (options: SchedulerUpdateOptions = {}) => {
    let { force = false, batchId, state: parentState } = options

    if (force) _updateForce = true
    if (_updateQueued) return

    if (!batchId) {
      batchId = createBatchId()
      BATCHID_TO_ROOTSTATE_WEAKMAP.set(batchId, createRootStateMap(state, () => update({
        force,
        batchId,
      })))
    } else {
      let states = BATCH_UPDATED_STATES_WEAK_MAP.get(batchId)
      if (!states) {
        states = new Set()
        BATCH_UPDATED_STATES_WEAK_MAP.set(batchId, states)
      } else if (states.has(state)) {
        return
      }

      states.add(state)
    }

    if (parentState) {
      addChildrenToStateMap(batchId, layoutEffectsSymbol, parentState, state)
      addChildrenToStateMap(batchId, effectsSymbol, parentState, state)
    } else {

      const rootStateMap = BATCHID_TO_ROOTSTATE_WEAKMAP.get(batchId)
      const rootState = rootStateMap?.get(state)
      if (!BATCH_TO_RUNNING_WEAK_MAP.get(batchId)) {
        BATCH_TO_RUNNING_WEAK_MAP.set(batchId, true)

        if (rootState) {
          rootState.started = true
        }
      } else if (!rootState?.started) {
        return
      }
    }

    if (isFlushing) {
      _updateQueued = true
      const options = {
        force: _updateForce,
        batchId,
        state,
      }
      const result = handlePhase(updateSymbol, undefined, options)
      handlePhase(commitSymbol, result, options)
      handlePhase(effectsSymbol, result, options)
      _updateForce = false
      _updateQueued = false
    } else {
      read(() => {
        const options = {
          force: _updateForce,
          batchId,
          state,
        }
        const result = handlePhase(updateSymbol, undefined, options)
        write(() => {
          handlePhase(commitSymbol, result, options)
          write(() => {
            handlePhase(effectsSymbol, result, options)
          })
          return result
        })
        _updateForce = false
        _updateQueued = false
      })
      _updateQueued = true
    }
  }
  const state = createState(update, host)

  const runEffects = (phase: EffectsSymbols, noChange = false): void => {
    if (!noChange && (state.host as any)._$isConnected) state.runEffects(phase)
  }

  const scheduler: Scheduler<H> = {
    state,
    update,
    render(): unknown {
      throw new Error('Method not implemented.')
    },
    commit(): void {
      throw new Error('Method not implemented.')
    },
    teardown(): void {
      state.teardown()
    },
  }

  return scheduler as T
}
