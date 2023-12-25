import { State } from './state'
import { effectsSymbol, layoutEffectsSymbol } from './symbols'

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

export type BatchId = symbol

let batchId: BatchId | null = null
const BATCH_ID_FLUSHING = new WeakMap<symbol, boolean>()
export const createBatchId = (): BatchId => {
  if (batchId === null) {
    batchId = Symbol()
  }
  const flushing = BATCH_ID_FLUSHING.get(batchId)
  if (!flushing) {
    BATCH_ID_FLUSHING.set(batchId, true)
    Promise.resolve().then(() => {
      BATCH_ID_FLUSHING.delete(batchId!)
      batchId = null
    })
  }
  return batchId
}

interface RootStateValue {
  started: boolean
  [effectsSymbol]: boolean
  [layoutEffectsSymbol]: boolean
}

export type RootStateMap = Map<State<unknown>, RootStateValue>

const ROOT_STATE_FLUSHING = new WeakMap<RootStateMap, boolean>()
let rootStateMap: RootStateMap | null = null
export const createRootStateMap = (state: State): RootStateMap => {
  if (!rootStateMap) rootStateMap = new Map()
  rootStateMap.set(state, {
    started: false,
    [layoutEffectsSymbol]: false,
    [effectsSymbol]: false,
  })
  const flushing = ROOT_STATE_FLUSHING.get(rootStateMap)
  if (!flushing) {
    ROOT_STATE_FLUSHING.set(rootStateMap, true)
    Promise.resolve().then(() => {
      ROOT_STATE_FLUSHING.delete(rootStateMap!)
      rootStateMap = null
    })
  }
  return rootStateMap
}

export { clear, current, setCurrent, notify, setFlushing, isFlushing }
