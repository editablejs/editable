import { ChildPart, Disconnectable, TemplateInstance } from './lit-html/html'
import { Context, getContextListener } from './create-context'
import { CreateHook, hook, Hook } from './hook'
import { Callable } from './state'
import { setEffects } from './use-effect'

type CreateContextHook<T = unknown> = CreateHook<[Context<T>], T, Element | ChildPart>

interface ContextHook<T> extends Hook<[Context<T>], T, Element | ChildPart>, Callable {
  update(Context: Context<T>): T
  teardown(): void
}

/**
 * @function
 * @template T
 * @param    {Context<T>} context
 * @return   {T}
 */
const useContext = <T>(context: Context<T>): T => {
  return hook(create<T>())(context)
}

export { useContext }

type ChildWithParent<T> = T & Record<'_$parent', ChildPart | TemplateInstance | undefined>
const create = <T>() => {
  const _create: CreateContextHook<T> = (id, state) => {
    let Context: Context<T>
    let value: T
    let _ranEffect: boolean = false
    let _unsubscribe: VoidFunction | null = null

    const _updater = (_value: T): void => {
      value = _value
      state.update({
        force: true,
      })
    }

    const _subscribe = (Context: Context<T>): void => {
      const childPart = state.host as ChildWithParent<ChildPart>
      let parent: Disconnectable | undefined = childPart
      while (parent) {
        const contextListener = getContextListener(parent as ChildPart)
        if (contextListener?.Context === Context) {
          value = contextListener.subscribe(_updater)
          _unsubscribe = () => contextListener.unsubscribe(_updater)
          break
        }
        parent = parent._$parent
      }
      if (!_unsubscribe) {
        value = Context.defaultValue
      }
    }
    const hook: ContextHook<T> = {
      id,
      state,
      update: nextContext => {
        if (Context !== nextContext) {
          _subscribe(nextContext)
          Context = nextContext
        }

        return value
      },
      call: () => {
        if (!_ranEffect) {
          _ranEffect = true
          if (_unsubscribe) _unsubscribe()
          _subscribe(Context)
          state.update()
        }
      },
      teardown: () => {
        _unsubscribe?.()
      },
    }

    setEffects(state, hook)

    return hook
  }

  return _create
}
