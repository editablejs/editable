import { makeComponent, CustomCreator, makeDefine, DefineCreator } from './component'
import { ChildPart } from 'lit-html'

type Component<P> = HTMLElement & P

type CustomComponentOrVirtualComponent<P = {}, T = HTMLElement | ChildPart> = T extends HTMLElement
  ? Component<P>
  : ChildPart

type FunctionComponent<P = {}, T = HTMLElement | ChildPart> = (
  this: CustomComponentOrVirtualComponent<P, T>,
  props: T extends HTMLElement ? Component<P> : P,
) => unknown | void

type FC<P = {}, T = HTMLElement | ChildPart> = FunctionComponent<P, T>

type RenderFunction = (result: unknown, container: DocumentFragment | HTMLElement) => ChildPart

interface Options {
  render: RenderFunction
}

const create = ({
  render,
}: Options): {
  define: DefineCreator
  custom: CustomCreator
} => {
  const custom = makeComponent(render)
  const define = makeDefine(custom)

  return { define, custom }
}

export default create

export type { Options, RenderFunction, CustomComponentOrVirtualComponent, FunctionComponent, FC }
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
export { hook } from './hook'
export type { Hook } from './hook'
export { createScheduler } from './scheduler'
export type { Scheduler } from './scheduler'
export { createState } from './state'
