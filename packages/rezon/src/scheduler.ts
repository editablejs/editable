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
import { ChildPart } from './lit-html/html'
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
        runEffects(layoutEffectsSymbol)
        return
      case updateSymbol:
        return scheduler.render(force)
      case effectsSymbol:
        return runEffects(effectsSymbol)
    }
  }
  let _updateQueued = false
  let _updateForce = false
  const update = (force?: boolean) => {
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
