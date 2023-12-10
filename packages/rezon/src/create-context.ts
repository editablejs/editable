import { ChildPart, html } from 'lit-html'
import { useContext } from './use-context'
import { useEffect } from './use-effect'
import { VirtualDirectiveComponent, virtual } from './virtual'

// interface ConsumerProps<T> {
//   render: (value: T) => unknown
// }

// interface Creator {
//   <T>(defaultValue: T): Context<T>
// }

// interface Context<T> {
//   Provider: CustomConstructor<{}>
//   Consumer: CustomConstructor<ConsumerProps<T>>
//   defaultValue: T
// }

// interface ContextDetail<T> {
//   Context: Context<T>
//   callback: (value: T) => void

//   // These properties will not exist if a context consumer lacks a provider
//   value: T
//   unsubscribe?: (this: Context<T>) => void
// }

// const makeContext = (component: CustomCreator): Creator => {
//   return <T>(defaultValue: T): Context<T> => {
//     const Context: Context<T> = {
//       Provider: class extends BaseElement {
//         listeners: Set<(value: T) => void>
//         _value!: T

//         constructor() {
//           super()
//           this.listeners = new Set()

//           this.addEventListener(contextEvent, this)
//         }

//         disconnectedCallback(): void {
//           this.removeEventListener(contextEvent, this)
//         }

//         handleEvent(event: CustomEvent<ContextDetail<T>>): void {
//           const { detail } = event

//           if (detail.Context === Context) {
//             detail.value = this.value
//             detail.unsubscribe = this.unsubscribe.bind(this, detail.callback)

//             this.listeners.add(detail.callback)

//             event.stopPropagation()
//           }
//         }

//         unsubscribe(callback: (value: T) => void): void {
//           this.listeners.delete(callback)
//         }

//         set value(value: T) {
//           this._value = value
//           for (let callback of this.listeners) {
//             callback(value)
//           }
//         }

//         get value(): T {
//           return this._value
//         }
//       },

//       Consumer: component<ConsumerProps<T>>(
//         ({ render }: ConsumerProps<T>): unknown => {
//           const context = useContext(Context)

//           return render(context)
//         },
//         {
//           useShadowDOM: false,
//         },
//       ),

//       defaultValue,
//     }

//     return Context
//   }
// }


export interface ContextProviderProps<T = {}> {
  value: T
  children: unknown
}

export interface ContextConsumerProps<T = {}> {
  render: (value: T) => unknown
}

export interface Context<T = {}> {
  Provider: VirtualDirectiveComponent<ContextProviderProps<T>>
  Consumer: (render: (value: T) => unknown) => unknown
  defaultValue: T
}


export interface ContextListener<T> {
  Context: Context<T>
  subscribe(callback: (value: T) => void): T
  unsubscribe(callback: (value: T) => void): void
}

const CHILD_PART_TO_CONTEXT_LISTENER = new WeakMap<ChildPart, ContextListener<any>>()

export const hasContextListener = (part: ChildPart) => CHILD_PART_TO_CONTEXT_LISTENER.has(part)

export const setContextListener = (part: ChildPart, listener: ContextListener<any>) => CHILD_PART_TO_CONTEXT_LISTENER.set(part, listener)

export const getContextListener = (part: ChildPart) => CHILD_PART_TO_CONTEXT_LISTENER.get(part)

export const createContext = <T = {}>(defaultValue: T) => {
  const listeners: Set<(value: T) => void> = new Set()
  let currentValue: T = defaultValue
  const contextListener = {
    Context: null as unknown as Context<T>,
    subscribe: (callback: (value: T) => void) => {
      listeners.add(callback)
      return currentValue
    },
    unsubscribe: (callback: (value: T) => void) => {
      listeners.delete(callback)
    }
  }
  const Context: Context<T> = {
    Provider: virtual<ContextProviderProps<T>>(function (props) {
      const { children, value } = props
      currentValue = value
      if (!hasContextListener(this)) {
        contextListener.Context = Context
        setContextListener(this, contextListener)
      }

      for (const callback of listeners) {
        callback(value)
      }

      useEffect(() => {
        return () => {
          listeners.clear()
        }
      }, [])
      return html`${children}`
    }),
    Consumer: (render: (value: T) => unknown) => {
      return virtual(function () {
        // eslint-disable-next-line
        const context = useContext(Context)
        return render(context)
      })()
    },
    defaultValue,
  }

  return Context
}
