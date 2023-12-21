import { State, createState } from './state'
import {
  commitSymbol,
  phaseSymbol,
  updateSymbol,
  effectsSymbol,
  Phase,
  layoutEffectsSymbol,
  EffectsSymbols,
} from './symbols'
import { CustomComponentOrVirtualComponent } from './core'
import { ChildPart, Disconnectable } from './lit-html/html'
import { isFlushing, setFlushing } from './interface'

const defer = Promise.resolve().then.bind(Promise.resolve())

export const flushSync = (cb: VoidFunction) => {
  setFlushing(true)
  cb()
  setFlushing(false)
}

const runner = () => {
  let tasks: VoidFunction[] = []
  let id: Promise<void> | null

  const runTasks = () => {
    id = null
    let t = tasks
    tasks = []
    for (var i = 0, len = t.length; i < len; i++) {
      t[i]()
    }
  }

  return (task: VoidFunction) => {
    tasks.push(task)
    if (id == null) {
      id = defer(runTasks)
    }
  }
}

const read = runner()
const write = runner()

export interface Scheduler<
  P = {},
  T = HTMLElement | ChildPart,
  H = CustomComponentOrVirtualComponent<P, T>,
> {
  state: State<H>
  [phaseSymbol]: Phase | null
  update(): void
  render(force?: boolean): unknown
  commit(result: unknown): void
  teardown(): void
}

const CHILDPART_TO_EFFECT_WEAKMAP: WeakMap<Disconnectable, VoidFunction> = new WeakMap()
const CHILDPART_TO_EFFECT_SCHEDULER_WEAKMAP: WeakMap<
  Disconnectable,
  Set<Scheduler<unknown, unknown, unknown>>
> = new WeakMap()

const CHILDPART_TO_LAYOUT_EFFECT_WEAKMAP: WeakMap<Disconnectable, VoidFunction> = new WeakMap()
const CHILDPART_TO_LAYOUT_EFFECT_SCHEDULER_WEAKMAP: WeakMap<
  Disconnectable,
  Set<Scheduler<unknown, unknown, unknown>>
> = new WeakMap()

const handleEffects = (
  host: ChildPart,
  phase: EffectsSymbols,
  run: (phase: EffectsSymbols) => void,
) => {
  const schedulers =
    phase === effectsSymbol
      ? CHILDPART_TO_EFFECT_SCHEDULER_WEAKMAP.get(host)
      : CHILDPART_TO_LAYOUT_EFFECT_SCHEDULER_WEAKMAP.get(host)
  if (schedulers && schedulers.size > 0) {
    let effects =
      phase === effectsSymbol
        ? CHILDPART_TO_EFFECT_WEAKMAP.get(host)
        : CHILDPART_TO_LAYOUT_EFFECT_WEAKMAP.get(host)
    if (!effects) {
      effects = () => run(phase)
      phase === effectsSymbol
        ? CHILDPART_TO_EFFECT_WEAKMAP.set(host, effects)
        : CHILDPART_TO_LAYOUT_EFFECT_WEAKMAP.set(host, effects)
    }
  } else {
    return run(phase)
  }
}

const handleEffectScheduler = (
  host: ChildPart,
  scheduler: Scheduler<unknown, unknown, unknown>,
) => {
  ;[CHILDPART_TO_EFFECT_SCHEDULER_WEAKMAP, CHILDPART_TO_LAYOUT_EFFECT_SCHEDULER_WEAKMAP].forEach(
    map => {
      let schedulers = map.get(host)
      if (!schedulers) {
        schedulers = new Set()
        map.set(host, schedulers)
      }
      schedulers.add(scheduler)
    },
  )
}

const handleRunEffects = (
  host: ChildPart,
  phase: EffectsSymbols,
  scheduler?: Scheduler<unknown, unknown, unknown>,
) => {
  const schedulers =
    phase === effectsSymbol
      ? CHILDPART_TO_EFFECT_SCHEDULER_WEAKMAP.get(host)
      : CHILDPART_TO_LAYOUT_EFFECT_SCHEDULER_WEAKMAP.get(host)

  if (schedulers && scheduler) {
    schedulers.delete(scheduler)
  }
  if (!schedulers || schedulers.size === 0) {
    const effects =
      phase === effectsSymbol
        ? CHILDPART_TO_EFFECT_WEAKMAP.get(host)
        : CHILDPART_TO_LAYOUT_EFFECT_WEAKMAP.get(host)
    if (effects) {
      effects()
      phase === effectsSymbol
        ? CHILDPART_TO_EFFECT_WEAKMAP.delete(host)
        : CHILDPART_TO_LAYOUT_EFFECT_WEAKMAP.delete(host)
    }
  }
}

const getParent = (host: ChildPart): ChildPart | null => {
  let parent = host._$parent
  while (parent && (parent as ChildPart).type !== 2) {
    parent = parent._$parent
  }
  return parent as ChildPart
}

export const createScheduler = <
  P = {},
  T = HTMLElement | ChildPart,
  H = CustomComponentOrVirtualComponent<P, T>,
>(
  host: H,
) => {
  const handlePhase = (phase: Phase, arg?: unknown, force?: boolean) => {
    scheduler[phaseSymbol] = phase
    switch (phase) {
      case commitSymbol:
        scheduler.commit(arg)
        if (state.virtual) {
          handleEffects(host as ChildPart, layoutEffectsSymbol, runEffects)
        } else {
          runEffects(layoutEffectsSymbol)
        }
        return
      case updateSymbol:
        return scheduler.render(force)
      case effectsSymbol:
        if (state.virtual) {
          handleEffects(host as ChildPart, effectsSymbol, runEffects)
        } else {
          runEffects(effectsSymbol)
        }
    }
  }
  let _updateQueued = false
  let _updateForce = false
  const update = (force?: boolean) => {
    if (state.virtual) {
      const parent = getParent(host as ChildPart)
      if (parent) {
        handleEffectScheduler(parent, scheduler)
      }
    }
    if (force) _updateForce = true
    if (_updateQueued) return
    if (isFlushing) {
      _updateQueued = true
      const result = handlePhase(updateSymbol, undefined, _updateForce)
      handlePhase(commitSymbol, result, _updateForce)
      handlePhase(effectsSymbol)
      _updateForce = false
      _updateQueued = false
    } else {
      read(() => {
        let result = handlePhase(updateSymbol, undefined, _updateForce)
        write(() => {
          handlePhase(commitSymbol, result, _updateForce)

          write(() => {
            handlePhase(effectsSymbol)
          })
        })
        _updateForce = false
        _updateQueued = false
      })
      _updateQueued = true
    }
  }
  const state = createState(update, host)

  const runEffects = (phase: EffectsSymbols): void => {
    state._runEffects(phase)
    if (!state.virtual) return
    const parent = getParent(host as ChildPart)
    if (parent) {
      handleRunEffects(parent, phase, scheduler)
    }
  }

  const scheduler: Scheduler<P, T, H> = {
    state,
    update,
    [phaseSymbol]: null,
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

  return scheduler
}
