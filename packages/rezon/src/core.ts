import { ChildPart } from './lit-html/html'

type Component<P = {}> = (
  this: ChildPart & { currentOptions?: Record<string, unknown> },
  props: P,
) => unknown | void

type Render = (result: unknown, container: DocumentFragment | HTMLElement) => ChildPart

interface RenderOptions {
  render: Render
}

export type { RenderOptions, Render, Component }
export { useCallback } from './use-callback'
export { useController } from './use-controller'
export { useEffect } from './use-effect'
export { useLayoutEffect } from './use-layout-effect'
export { useState } from './use-state'
export type { StateUpdater, SetStateAction } from './use-state'
export { useMemo } from './use-memo'
export { useContext } from './use-context'
export { useRef } from './use-ref'
export type { RefObject, Ref, RefCallback, MutableRefObject } from './use-ref'
export { useReducer } from './use-reducer'
export type { Reducer, Dispatch } from './use-reducer'
export { useImperativeHandle } from './use-imperative-handle'
export { hook } from './hook'
export type { Hook } from './hook'
export { createScheduler } from './scheduler'
export type { Scheduler } from './scheduler'
export { createState } from './state'
