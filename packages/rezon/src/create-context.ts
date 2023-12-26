import { ChildPart } from './lit-html/html'
import { useContext } from './use-context'
import { useEffect } from './use-effect'
import { useLayoutEffect } from './use-layout-effect'
import { ComponentDirective, c } from './component'
export interface ContextProviderProps<T = {}> {
  value: T
  children: unknown
}

export interface ContextConsumerProps<T = {}> {
  render: (value: T) => unknown
}

export interface Context<T = {}> {
  Provider: ComponentDirective<ContextProviderProps<T>>
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

export const setContextListener = (part: ChildPart, listener: ContextListener<any>) =>
  CHILD_PART_TO_CONTEXT_LISTENER.set(part, listener)

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
    },
  }
  const Context: Context<T> = {
    Provider: c<ContextProviderProps<T>>(function (props) {
      const { children, value } = props
      currentValue = value
      const isInitialRender = !hasContextListener(this)
      if (isInitialRender) {
        contextListener.Context = Context
        setContextListener(this, contextListener)
      }

      useLayoutEffect(() => {
        if (isInitialRender) return
        for (const callback of listeners) {
          callback(value)
        }
      }, [value])

      useEffect(() => {
        return () => {
          listeners.clear()
        }
      }, [])

      return children
    }),
    Consumer: (render: (value: T) => unknown) => {
      return c(function () {
        // eslint-disable-next-line
        const context = useContext(Context)
        return render(context)
      })()
    },
    defaultValue,
  }

  return Context
}
