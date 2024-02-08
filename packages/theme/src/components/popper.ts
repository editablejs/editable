import { createStore, deepEqual, shallow } from "@editablejs/store";
import { CreatePopper, PopperState } from "../interfaces/popper";
import { DOM_CONNECTED_TO_SUBSCRIBE, DOM_DISCONNECTED_TO_UNSUBSCRIBE } from "../utils/weak-map";
import { Middleware, Placement, Strategy, computePosition, offset, shift, arrow as floatingUIarrow, flip, hide, ComputePositionReturn, limitShift } from "@floating-ui/dom";
import { append, createRef, element } from "@editablejs/dom-utils";

type Side = NonNullable<PopperState['side']>
type Align = NonNullable<PopperState['align']>

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null
}

const transformOrigin = (options: { arrowWidth: number; arrowHeight: number }): Middleware => ({
  name: 'transformOrigin',
  options,
  fn(data) {
    const { placement, rects, middlewareData } = data

    const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0
    const isArrowHidden = cannotCenterArrow
    const arrowWidth = isArrowHidden ? 0 : options.arrowWidth
    const arrowHeight = isArrowHidden ? 0 : options.arrowHeight

    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement)
    const noArrowAlign = { start: '0%', center: '50%', end: '100%' }[placedAlign]

    const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2
    const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2

    let x = ''
    let y = ''

    if (placedSide === 'bottom') {
      x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`
      y = `${-arrowHeight}px`
    } else if (placedSide === 'top') {
      x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`
      y = `${rects.floating.height + arrowHeight}px`
    } else if (placedSide === 'right') {
      x = `${-arrowHeight}px`
      y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`
    } else if (placedSide === 'left') {
      x = `${rects.floating.width + arrowHeight}px`
      y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`
    }
    return { data: { x, y } }
  },
})

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-')
  return [side as Side, align as Align] as const
}

const getDesiredPlacement = (side: Side, align: Align) => {
  return (side + (align !== 'center' ? '-' + align : '')) as Placement
}

interface UpdateFloatingOptions extends PopperState {
  arrow?: HTMLElement
  arrowSize?: { width: number; height: number }
  floating: HTMLElement
}

const updateFloating = (options: UpdateFloatingOptions) => {
  const { strategy = 'absolute', side = 'bottom', sideOffset = 0, align = 'center', alignOffset = 0, arrowPadding = 0,collisionBoundary = [],
      collisionPadding: collisionPaddingProp = 0,
      sticky = 'partial',
      hideWhenDetached = false,
    avoidCollisions = true,
    anchor,
    arrow,
    arrowSize,
    floating
  } = options
  const desiredPlacement = getDesiredPlacement(side, align)

  const collisionPadding =
      typeof collisionPaddingProp === 'number'
        ? collisionPaddingProp
      : { top: 0, right: 0, bottom: 0, left: 0, ...collisionPaddingProp }

  const boundary = Array.isArray(collisionBoundary) ? collisionBoundary : [collisionBoundary]
  const hasExplicitBoundaries = boundary.length > 0

  const detectOverflowOptions = {
    padding: collisionPadding,
    boundary: boundary.filter(isNotNull),
    // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
    altBoundary: hasExplicitBoundaries,
  }

  const arrowWidth = arrowSize?.width ?? 0
  const arrowHeight = arrowSize?.height ?? 0

  return computePosition(anchor, floating, {
      middleware: [
        offset({ mainAxis: sideOffset + arrowHeight, alignmentAxis: alignOffset }),
        avoidCollisions
          ? shift({
              mainAxis: true,
              crossAxis: false,
              limiter: sticky === 'partial' ? limitShift() : undefined,
              ...detectOverflowOptions,
            })
          : undefined,
        arrow ? floatingUIarrow({ element: arrow, padding: arrowPadding }) : undefined,
        avoidCollisions ? flip({ ...detectOverflowOptions }) : undefined,
        transformOrigin({ arrowWidth, arrowHeight }),
        hideWhenDetached ? hide({ strategy: 'referenceHidden' }) : undefined,
      ].filter(isDefined),
      placement: desiredPlacement,
      strategy
    })
}

export const createPopper: CreatePopper = (props, ref) => {
  const store = createStore(() => props)
  if (ref) ref.current = store

  const floatingElement = element('div')
  floatingElement.style.minWidth = 'max-content'

  const contentElement = element('div')
  append(floatingElement, contentElement)

  const update = (state: PopperState, prevState?: PopperState) => {

    updateFloating({ ...state, floating: floatingElement }).then((data) => {
      floatingElement.style.position = data.strategy
      const { x, y } = data
      const isPlaced = x !== null && y !== null
      floatingElement.style.top = isPlaced ? `${y}px` : '0'
      floatingElement.style.left = isPlaced ? `${x}px` : '-200%'
    })
  }

  const { anchor } = props
  const subscribe = () => {
    update(store.getState())
    const unsubscribe = store.subscribe(update)
    DOM_DISCONNECTED_TO_UNSUBSCRIBE.set(anchor, unsubscribe)
  }

  subscribe()

  DOM_CONNECTED_TO_SUBSCRIBE.set(anchor, subscribe)
  const fragment = new DocumentFragment()
  if (anchor instanceof Element) {
    fragment.appendChild(anchor)
  }
  fragment.appendChild(floatingElement)
  return fragment
}
