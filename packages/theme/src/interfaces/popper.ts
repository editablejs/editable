import { RefObject } from "@editablejs/dom-utils"
import { StoreApi } from "@editablejs/store"
import { Strategy } from '@floating-ui/dom'
import { Measurable } from "../utils/observe-element-rect"
import { BaseState } from "./base"

const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left'] as const
const ALIGN_OPTIONS = ['start', 'center', 'end'] as const

type Side = (typeof SIDE_OPTIONS)[number]
type Align = (typeof ALIGN_OPTIONS)[number]

type Boundary = Element | null

export interface PopperContentState extends BaseState {
  placedSide: Side
  onArrowChange(arrow: HTMLSpanElement | null): void
  arrowX?: number
  arrowY?: number
  shouldHideArrow: boolean
}

export interface PopperState extends BaseState {
  anchor: Measurable
  dispatchRefreshCustomEvent?: string
  strategy?: Strategy
  side?: Side
  sideOffset?: number
  align?: Align
  alignOffset?: number
  arrowPadding?: number
  collisionBoundary?: Boundary | Boundary[]
  collisionPadding?: number | Partial<Record<Side, number>>
  sticky?: 'partial' | 'always'
  hideWhenDetached?: boolean
  avoidCollisions?: boolean
  autoUpdate?: boolean
}

export type CreatePopper = (props: PopperState, ref?: RefObject<StoreApi<PopperState>>) => unknown
