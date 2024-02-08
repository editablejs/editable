import { current, notify } from './interface'
import { State, getHooks } from './state'

export interface Hook<P extends unknown[] = unknown[], R = unknown, H = unknown> {
  id: number
  state: State<H>
  update(...args: P): R
  teardown?(): void
}

export type CreateHook<P extends unknown[] = unknown[], R = unknown, H = unknown> = (
  id: number,
  state: State<H>,
  ...args: P
) => Hook<P, R, H>

const use = <P extends unknown[], R, H = unknown>(create: CreateHook<P, R, H>, ...args: P): R => {
  if (!current) throw new Error('No current state')
  let id = notify()
  let hooks = getHooks(current)

  let hook = hooks.get(id) as Hook<P, R, H> | undefined
  if (!hook) {
    hook = create(id, current as State<H>, ...args)
    hooks.set(id, hook)
  }

  return hook.update(...args)
}

const hook = <P extends unknown[], R, H = unknown>(
  create: CreateHook<P, R, H>,
): ((...args: P) => R) => {
  return (...args: P) => use(create, ...args)
}

export { hook }
