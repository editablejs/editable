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
import { ChildPart } from 'lit-html'

const defer = Promise.resolve().then.bind(Promise.resolve())

let isFlushing = false
export const flushSync = (cb: VoidFunction) => {
  isFlushing = true
  cb()
  isFlushing = false
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
  render(): unknown
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
  const handlePhase = (phase: Phase, arg?: unknown) => {
    scheduler[phaseSymbol] = phase
    switch (phase) {
      case commitSymbol:
        scheduler.commit(arg)
        runEffects(layoutEffectsSymbol)
        return
      case updateSymbol:
        return scheduler.render()
      case effectsSymbol:
        return runEffects(effectsSymbol)
    }
  }
  let _updateQueued = false
  const update = () => {
    if (isFlushing) {
      const result = handlePhase(updateSymbol)
      handlePhase(commitSymbol, result)
      handlePhase(effectsSymbol)
      return
    }
    if (_updateQueued) return
    read(() => {
      let result = handlePhase(updateSymbol)
      write(() => {
        handlePhase(commitSymbol, result)

        write(() => {
          handlePhase(effectsSymbol)
        })
      })
      _updateQueued = false
    })
    _updateQueued = true
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
