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

const runWithCurrent = <T>(state: State, cb: () => T): T => {
  setCurrent(state)
  const result = cb()
  clear()
  return result
}

const setFlushing = (flushing: boolean): void => {
  isFlushing = flushing
}

const defer = Promise.resolve().then.bind(Promise.resolve())

type Task = () => unknown | void

export const createTaskQueue = (callback?: (tasks: Task[]) => void) => {
  let tasks: Task[] = []
  let id: Promise<void> | null

  const runTasks = () => {
    id = null
    let t = tasks
    tasks = []
    callback = callback || ((tasks: Task[]) => {
      for (let i = 0, len = tasks.length; i < len; i++) {
        tasks[i]()
      }
    })
    callback(t)
  }

  return (task: VoidFunction) => {
    tasks.push(task)
    if (id == null) {
      id = defer(runTasks)
    }
  }
}

export const createTaskBatch = (callback?: (tasks: Task[]) => void) => {
  let flushing = false
  const tasks: Task[] = []
  return (task: VoidFunction) => {
    tasks.push(task)
    if (!flushing) {
      flushing = true
      Promise.resolve().then(() => {
        flushing = false
        callback = callback || ((tasks: Task[]) => {
          for (let i = 0, len = tasks.length; i < len; i++) {
            tasks[i]()
          }
        })
        callback(tasks)
        tasks.length = 0
      })
    }
  }
}

const TASK_QUEUE_TO_DATA_WEAK_MAP = new WeakMap<Function>()

const TASK_QUEUE_TO_RUNNER_WEAK_MAP = new WeakMap<WeakKey, (task: VoidFunction) => void>()

function createTaskBatchWithData<T extends WeakKey>(createData: (data?: T) => T): T {
  const prevData = TASK_QUEUE_TO_DATA_WEAK_MAP.get(createData) as T | undefined;
  const nextData = createData(prevData)
  TASK_QUEUE_TO_DATA_WEAK_MAP.set(createData, nextData)

  let runner = TASK_QUEUE_TO_RUNNER_WEAK_MAP.get(nextData)
  if (!runner) {
    runner = createTaskBatch()
    TASK_QUEUE_TO_RUNNER_WEAK_MAP.set(nextData, runner)
    runner(() => {
      TASK_QUEUE_TO_RUNNER_WEAK_MAP.delete(nextData)
      TASK_QUEUE_TO_DATA_WEAK_MAP.delete(createData)
    })
  }

  return nextData;
}

export type BatchId = symbol

export const createBatchId = (): BatchId => {
  return createTaskBatchWithData((batchId?: BatchId) => {
    if (batchId == null) {
      batchId = Symbol()
    }
    return batchId
  })
}

interface RootStateValue {
  started: boolean
  [effectsSymbol]: boolean
  [layoutEffectsSymbol]: boolean
  run: () => void
}

export type RootStateMap = Map<State<unknown>, RootStateValue>

export const createRootStateMap = (state: State, run: () => void): RootStateMap => {
  return createTaskBatchWithData((rootStateMap?: RootStateMap) => {
    if (!rootStateMap) rootStateMap = new Map()
    rootStateMap.set(state, {
      started: false,
      [layoutEffectsSymbol]: false,
      [effectsSymbol]: false,
      run
    })
    return rootStateMap
  })
}

export { clear, current, setCurrent, runWithCurrent, notify, setFlushing, isFlushing }
