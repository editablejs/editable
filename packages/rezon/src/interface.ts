import { State } from './state'

let current: State | null
let currentId = 0

const setCurrent = (state: State): void => {
  current = state
}

const clear = (): void => {
  current = null
  currentId = 0
}

const notify = (): number => {
  return currentId++
}

export { clear, current, setCurrent, notify }
