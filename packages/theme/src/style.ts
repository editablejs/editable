import { createStore } from '@editablejs/store'

type CreateClassCallback = <T>(state: T) => string

export const createStyle = <T>(callback: CreateClassCallback, elements: HTMLElement[], initializer?: T) => {
  const store = createStore<T>(() => initializer || ({} as T))
  const update = () => {
    const state = store.getState()
    const className = callback(state)
    for (const element of elements)
      element.className = className
  }
  const unsubscribe = store.subscribe(update)
  return [
    store.setState,
    unsubscribe,
  ] as const
}
