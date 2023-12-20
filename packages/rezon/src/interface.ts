import { State } from './state'

let current: State | null
let currentId = 0
let isFlushing = false
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

const setFlushing = (flushing: boolean): void => {
  isFlushing = flushing
}

export { clear, current, setCurrent, notify, setFlushing, isFlushing }
