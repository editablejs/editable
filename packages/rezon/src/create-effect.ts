import { CreateHook, Hook, hook } from './hook'
import { State, Callable } from './state'
import { isFunction } from './utils'

type Effect = (this: State) => void | VoidFunction | Promise<void>

interface EffectHook extends Hook, Callable {
  update(callback: Effect, values?: unknown[]): void
  teardown(): void
}

const createEffect = (setEffects: (state: State, cb: Callable) => void) => {
  const create: CreateHook = (id: number, state: State) => {
    let callback: Effect | undefined = undefined
    let _teardown: Promise<void> | VoidFunction | void = undefined

    let lastValues: unknown[] | undefined
    let values: unknown[] | undefined

    const run = (hook: EffectHook) => {
      hook.teardown()
      _teardown = callback?.call(hook.state)
    }

    const hasChanged = () => {
      return !lastValues || values!.some((value, i) => lastValues![i] !== value)
    }

    const hook: EffectHook = {
      id,
      state,
      update: (_callback: Effect, _values?: unknown[]) => {
        callback = _callback
        values = _values
      },
      call: () => {
        const changed = !values || hasChanged()
        lastValues = values
        if (changed) {
          run(hook)
        }
      },
      teardown: () => {
        if (isFunction(_teardown)) {
          _teardown()
        }
      },
    }

    setEffects(state, hook)

    return hook
  }
  return hook(create)
}

export { createEffect }
