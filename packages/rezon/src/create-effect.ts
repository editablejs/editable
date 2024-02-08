import { CreateHook, Hook, hook } from './hook'
import { createTaskQueue, runWithCurrent } from './interface'
import { State, Callable, pushEffects } from './state'
import { EffectsSymbols } from './symbols'
import { isFunction } from './utils'

type Effect = (this: State) => void | VoidFunction | Promise<void>

interface EffectHook extends Hook, Callable {
  update(callback: Effect, values?: unknown[]): void
  teardown(): void
}

const HOOK_TO_TEARDOWN_WEAK_MAP = new WeakMap<Hook, VoidFunction>()

const getTerdown = (hook: Hook) => {
  return HOOK_TO_TEARDOWN_WEAK_MAP.get(hook)
}

const HOOK_TO_EFFECT_WEAK_MAP = new WeakMap<Hook, Effect>()

const getEffect = (hook: Hook) => {
  return HOOK_TO_EFFECT_WEAK_MAP.get(hook)
}

const runner = createTaskQueue(tasks => {
  const teardowns: Function[] = []
  const effects: Function[] = []
  for (const task of tasks) {
    const [teardown, effect, hook] = task() as [VoidFunction | undefined, Effect, Hook]
    if (teardown) teardowns.push(() => runWithCurrent(hook.state, teardown))
    if (effect)
      effects.push(() => runWithCurrent(hook.state, () => {
        const callback = effect.call(hook.state)
        if (isFunction(callback)) {
          HOOK_TO_TEARDOWN_WEAK_MAP.set(hook, callback)
        }
      }))
  }
  for (const teardown of teardowns) {
    teardown()
  }
  for (const effect of effects) {
    effect()
  }
})

const createEffect = (phase: EffectsSymbols) => {
  const create: CreateHook = (id: number, state: State) => {
    let lastValues: unknown[] | undefined
    let values: unknown[] | undefined

    const hasChanged = () => {
      return !values || !lastValues || values.some((value, i) => lastValues![i] !== value)
    }

    const hook: EffectHook = {
      id,
      state,
      update: (effect: Effect, _values?: unknown[]) => {
        HOOK_TO_EFFECT_WEAK_MAP.set(hook, effect)
        values = _values
      },
      call: () => {
        const changed = hasChanged()
        lastValues = values
        if (changed) {
          runner(() => [getTerdown(hook), getEffect(hook), hook])
        }
      },
      teardown: () => runner(() => [getTerdown(hook), undefined, hook]),
    }

    pushEffects(state, hook, phase)

    return hook
  }
  return hook(create)
}

export { createEffect }
