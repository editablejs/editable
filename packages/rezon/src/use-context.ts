import { ChildPart, TemplateInstance } from 'lit-html'
import { Context, getContextListener } from './create-context'
import { CreateHook, hook, Hook } from './hook'
import { Callable, State } from './state'
import { setEffects } from './use-effect'

type CreateContextHook<T = unknown> = CreateHook<[Context<T>], T, Element | ChildPart>

interface ContextHook<T> extends Hook<[Context<T>], T, Element | ChildPart>, Callable {
  update(Context: Context<T>): T
  teardown(): void
}

// const create = <T>() => {
//   const _create: CreateContextHook<T> = (id, state) => {
//     let Context: Context<T>
//     let value: T
//     let _ranEffect: boolean = false
//     let _unsubscribe: VoidFunction | null = null

//     const _updater = (value: T): void => {
//       value = value
//       state.update()
//     }

//     const _subscribe = (Context: Context<T>): void => {
//       const detail = { Context, callback: _updater }
//       console.log('useContext')
//       let node = state.host

//       if (hook.state.virtual) {
//         let parent = node.parentNode
//         while (parent && !parent.dispatchEvent) {
//           parent = parent.parentNode
//         }
//         if (parent) {
//           node = parent as Element
//         } else {
//           node = ((node as ChildPart).startNode as Element)
//         }
//       }
//       if (node instanceof Element) {
//         node.dispatchEvent(
//           new CustomEvent(contextEvent, {
//             detail, // carrier
//             bubbles: true, // to bubble up in tree
//             cancelable: true, // to be able to cancel
//             composed: true, // to pass ShadowDOM boundaries
//           }),
//         )
//       }

//       const { unsubscribe = null, value: _value } = detail as ContextDetail<T>

//       value = unsubscribe ? _value : Context.defaultValue

//       _unsubscribe = unsubscribe
//     }
//     const hook: ContextHook<T> = {
//       id,
//       state,
//       update: nextContext => {
//         if (hook.state.virtual) {
//           // throw new Error("can't be used with virtual components")
//         }

//         if (Context !== nextContext) {
//           _subscribe(nextContext)
//           Context = nextContext
//         }

//         return value
//       },
//       call: () => {
//         if (!_ranEffect) {
//           _ranEffect = true
//           if (_unsubscribe) _unsubscribe()
//           _subscribe(Context)
//           state.update()
//         }
//       },
//       teardown: () => {
//         _unsubscribe?.()
//       },
//     }

//     setEffects(state, hook)

//     return hook
//   }

//   return _create
// }

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
      state.update()
    }

    const _subscribe = (Context: Context<T>): void => {
      if (hook.state.virtual) {
        const childPart = state.host as ChildWithParent<ChildPart>
        let parent = childPart._$parent
        while (parent) {
          const contextListener = getContextListener(parent as ChildPart)
          if (contextListener?.Context === Context) {
            value = contextListener.subscribe(_updater)
            _unsubscribe = () => contextListener.unsubscribe(_updater)
            break
          }
          parent = (parent as ChildWithParent<ChildPart>)._$parent
        }
        if (!_unsubscribe) {
          value = Context.defaultValue
        }
      }
      // if (node instanceof Element) {
      //   node.dispatchEvent(
      //     new CustomEvent(contextEvent, {
      //       detail, // carrier
      //       bubbles: true, // to bubble up in tree
      //       cancelable: true, // to be able to cancel
      //       composed: true, // to pass ShadowDOM boundaries
      //     }),
      //   )
      // }

      // const { unsubscribe = null, value: _value } = detail as ContextDetail<T>

      // value = unsubscribe ? _value : Context.defaultValue

      // _unsubscribe = unsubscribe
    }
    const hook: ContextHook<T> = {
      id,
      state,
      update: nextContext => {
        if (hook.state.virtual) {
          // throw new Error("can't be used with virtual components")
        }

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
