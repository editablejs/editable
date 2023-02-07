import * as React from 'react'
import {
  useFloating,
  autoUpdate,
  offset,
  shift,
  limitShift,
  hide,
  arrow as floatingUIarrow,
  flip,
  Strategy,
} from '@floating-ui/react-dom'

import type { Placement, Middleware } from '@floating-ui/react-dom'
import { useSize } from './hooks/use-size'
import { useComposedRefs } from './compose-refs'
import { Measurable } from './observe-element-rect'
import { useIsomorphicLayoutEffect } from './utils'
import { Arrow } from './arrow'
import { Slot } from './slot'
import { Root } from './root'

const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left'] as const
const ALIGN_OPTIONS = ['start', 'center', 'end'] as const

type Side = (typeof SIDE_OPTIONS)[number]
type Align = (typeof ALIGN_OPTIONS)[number]

/* -------------------------------------------------------------------------------------------------
 * Popper
 * -----------------------------------------------------------------------------------------------*/

const POPPER_NAME = 'Popper'

type PopperContextValue = {
  anchor: Measurable | null
  onAnchorChange(anchor: Measurable | null): void
}
const PopperContenxt = React.createContext<PopperContextValue>(null as any)

const usePopperContext = () => {
  const context = React.useContext(PopperContenxt)
  if (!context)
    throw new Error(`[usePopperContext] must be used within a ${POPPER_NAME} component.`)

  return context
}

interface PopperProps {
  children?: React.ReactNode
}

const Popper: React.FC<PopperProps> = (props: PopperProps) => {
  const { children } = props
  const [anchor, setAnchor] = React.useState<Measurable | null>(null)
  return (
    <PopperContenxt.Provider
      value={{
        anchor,
        onAnchorChange: setAnchor,
      }}
    >
      {children}
    </PopperContenxt.Provider>
  )
}

Popper.displayName = POPPER_NAME

/* -------------------------------------------------------------------------------------------------
 * PopperAnchor
 * -----------------------------------------------------------------------------------------------*/

const ANCHOR_NAME = 'PopperAnchor'

type PopperAnchorElement = React.ElementRef<typeof Root.div>
type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Root.div>

interface PopperAnchorProps extends PrimitiveDivProps {
  virtualRef?: React.RefObject<Measurable>
  dispatchRefreshCustomEvent?: string
}

const PopperAnchor = React.forwardRef<PopperAnchorElement, PopperAnchorProps>(
  (props: PopperAnchorProps, forwardedRef) => {
    const { virtualRef, dispatchRefreshCustomEvent, ...anchorProps } = props
    const context = usePopperContext()
    const ref = React.useRef<PopperAnchorElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, ref)

    React.useEffect(() => {
      // Consumer can anchor the popper to something that isn't
      // a DOM node e.g. pointer position, so we override the
      // `anchorRef` with their virtual ref in this case.
      context.onAnchorChange(virtualRef?.current || ref.current)
    })

    React.useEffect(() => {
      const handleRefresh = () => {
        const getBoundingClientRect = virtualRef?.current?.getBoundingClientRect
        if (!getBoundingClientRect) return
        context.onAnchorChange({ getBoundingClientRect })
      }
      if (dispatchRefreshCustomEvent) {
        document.addEventListener(dispatchRefreshCustomEvent, handleRefresh)
        return () => {
          document.removeEventListener(dispatchRefreshCustomEvent, handleRefresh)
        }
      }
    }, [])

    return virtualRef ? null : <Slot {...anchorProps} ref={composedRefs} />
  },
)

PopperAnchor.displayName = ANCHOR_NAME

/* -------------------------------------------------------------------------------------------------
 * PopperContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'PopperContent'

type PopperContentContextValue = {
  placedSide: Side
  onArrowChange(arrow: HTMLSpanElement | null): void
  arrowX?: number
  arrowY?: number
  shouldHideArrow: boolean
}

const PopperContentContext = React.createContext<PopperContentContextValue>({} as any)

const useContentContext = () => {
  const context = React.useContext(PopperContentContext)
  if (!context)
    throw new Error(`[usePopperContentContext] must be used within a ${CONTENT_NAME} component.`)

  return context
}

type PositionContextValue = {
  hasParent: false
  positionUpdateFns: Set<() => void>
}

const PositionContext = React.createContext<PositionContextValue>({
  hasParent: false,
  positionUpdateFns: new Set<() => void>(),
})

const usePositionContext = () => {
  const context = React.useContext(PositionContext)
  if (!context)
    throw new Error(`[usePositionContext] must be used within a ${CONTENT_NAME} component.`)
  return context
}

type Boundary = Element | null

type PopperContentElement = React.ElementRef<typeof Root.div>
interface PopperContentProps extends PrimitiveDivProps {
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

const PopperContent = React.forwardRef<PopperContentElement, PopperContentProps>(
  (props: PopperContentProps, forwardedRef) => {
    const {
      strategy: strategyProp = 'absolute',
      autoUpdate: autoUpdateProp = false,
      side = 'bottom',
      sideOffset = 0,
      align = 'center',
      alignOffset = 0,
      arrowPadding = 0,
      collisionBoundary = [],
      collisionPadding: collisionPaddingProp = 0,
      sticky = 'partial',
      hideWhenDetached = false,
      avoidCollisions = true,
      ...contentProps
    } = props

    const context = usePopperContext()

    const [content, setContent] = React.useState<HTMLDivElement | null>(null)
    const composedRefs = useComposedRefs(forwardedRef, node => setContent(node))

    const [arrow, setArrow] = React.useState<HTMLSpanElement | null>(null)
    const arrowSize = useSize(arrow)
    const arrowWidth = arrowSize?.width ?? 0
    const arrowHeight = arrowSize?.height ?? 0

    const desiredPlacement = (side + (align !== 'center' ? '-' + align : '')) as Placement

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

    const { reference, floating, strategy, x, y, placement, middlewareData, update } = useFloating({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: strategyProp,
      placement: desiredPlacement,
      whileElementsMounted: autoUpdateProp ? autoUpdate : undefined,
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
    })

    // assign the reference dynamically once `Content` has mounted so we can collocate the logic
    useIsomorphicLayoutEffect(() => {
      reference(context.anchor)
    }, [reference, context.anchor])

    const isPlaced = x !== null && y !== null
    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement)

    const arrowX = middlewareData.arrow?.x
    const arrowY = middlewareData.arrow?.y
    const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0

    const [contentZIndex, setContentZIndex] = React.useState<string>()
    useIsomorphicLayoutEffect(() => {
      if (content) setContentZIndex(window.getComputedStyle(content).zIndex)
    }, [content])

    const { hasParent, positionUpdateFns } = usePositionContext()
    const isRoot = !hasParent

    useIsomorphicLayoutEffect(() => {
      if (!isRoot) {
        positionUpdateFns.add(update)
        return () => {
          positionUpdateFns.delete(update)
        }
      }
    }, [isRoot, positionUpdateFns, update])

    // when nested contents are rendered in portals, they are appended out of order causing
    // children to be positioned incorrectly if initially open.
    // we need to re-compute the positioning once the parent has finally been placed.
    // https://github.com/floating-ui/floating-ui/issues/1531
    useIsomorphicLayoutEffect(() => {
      if (isRoot && isPlaced) {
        Array.from(positionUpdateFns)
          .reverse()
          .forEach(fn => requestAnimationFrame(fn))
      }
    }, [isRoot, isPlaced, positionUpdateFns])

    const commonProps = {
      'data-side': placedSide,
      'data-align': placedAlign,
      ...contentProps,
      ref: composedRefs,
      style: {
        ...contentProps.style,
        // if the PopperContent hasn't been placed yet (not all measurements done)
        // we prevent animations so that users's animation don't kick in too early referring wrong sides
        animation: !isPlaced ? 'none' : undefined,
        // hide the content if using the hide middleware and should be hidden
        opacity: middlewareData.hide?.referenceHidden ? 0 : undefined,
      },
    }

    return (
      <Root.div
        ref={floating}
        style={{
          position: strategy,
          left: isPlaced ? Math.round(x) : 0,
          top: isPlaced ? Math.round(y) : '-200%',
          // https://bugs.chromium.org/p/chromium/issues/detail?id=521364
          // transform: isPlaced
          //   ? `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
          //   : 'translate3d(0, -200%, 0)', // keep off the page when measuring
          minWidth: 'max-content',
          zIndex: contentZIndex,
        }}
      >
        <PopperContentContext.Provider
          value={{
            placedSide,
            onArrowChange: setArrow,
            arrowX,
            arrowY,
            shouldHideArrow: cannotCenterArrow,
          }}
        >
          {isRoot ? (
            <PositionContext.Provider
              value={{
                hasParent,
                positionUpdateFns,
              }}
            >
              <Root.div {...commonProps} />
            </PositionContext.Provider>
          ) : (
            <Root.div {...commonProps} />
          )}
        </PopperContentContext.Provider>
      </Root.div>
    )
  },
)

PopperContent.displayName = CONTENT_NAME

/* -------------------------------------------------------------------------------------------------
 * PopperArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'PopperArrow'

const OPPOSITE_SIDE: Record<Side, Side> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
}

type PopperArrowElement = React.ElementRef<typeof Arrow>
type ArrowProps = React.ComponentPropsWithoutRef<typeof Arrow>
interface PopperArrowProps extends ArrowProps {}

const PopperArrow = React.forwardRef<PopperArrowElement, PopperArrowProps>(function PopperArrow(
  props: PopperArrowProps,
  forwardedRef,
) {
  const { ...arrowProps } = props
  const contentContext = useContentContext()
  const baseSide = OPPOSITE_SIDE[contentContext.placedSide]

  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    <span
      ref={contentContext.onArrowChange}
      style={{
        position: 'absolute',
        left: contentContext.arrowX,
        top: contentContext.arrowY,
        [baseSide]: 0,
        transformOrigin: {
          top: '',
          right: '0 0',
          bottom: 'center 0',
          left: '100% 0',
        }[contentContext.placedSide],
        transform: {
          top: 'translateY(100%)',
          right: 'translateY(50%) rotate(90deg) translateX(-50%)',
          bottom: `rotate(180deg)`,
          left: 'translateY(50%) rotate(-90deg) translateX(50%)',
        }[contentContext.placedSide],
        visibility: contentContext.shouldHideArrow ? 'hidden' : undefined,
      }}
    >
      <Arrow
        {...arrowProps}
        ref={forwardedRef}
        style={{
          ...arrowProps.style,
          // ensures the element can be measured correctly (mostly for if SVG)
          display: 'block',
        }}
      />
    </span>
  )
})

PopperArrow.displayName = ARROW_NAME

/* -----------------------------------------------------------------------------------------------*/

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

export {
  //
  Popper,
  PopperAnchor,
  PopperContent,
  PopperArrow,
  //
  SIDE_OPTIONS,
  ALIGN_OPTIONS,
}
export type { PopperProps, PopperAnchorProps, PopperContentProps, PopperArrowProps }
