import tw, { css } from 'twin.macro'
import { useComposedRefs } from './compose-refs'
import { useDirection } from './direction'
import { useCallbackRef } from '@/hooks/use-callback-ref'
import { useStateMachine } from '@/hooks/use-state-machine'
import { Presence } from './presence'
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'
import { clamp, composeEventHandlers } from '@/utils'
import { createContext, useContext, useState, useRef, useEffect, useCallback, HTMLAttributes, virtual, html } from 'rezon'
import { ref } from 'rezon/directives/ref'
import { spread } from 'rezon/directives/spread'
import { styleMap } from 'rezon/directives/style-map'
import { unsafeHTML } from 'rezon/directives/unsafe-html'

type Direction = 'ltr' | 'rtl'
type Sizes = {
  content: number
  viewport: number
  scrollbar: {
    size: number
    paddingStart: number
    paddingEnd: number
  }
}

/* -------------------------------------------------------------------------------------------------
 * ScrollArea
 * -----------------------------------------------------------------------------------------------*/

const SCROLL_AREA_NAME = 'ScrollArea'

type ScrollAreaContextValue = {
  type: 'auto' | 'always' | 'scroll' | 'hover'
  dir: Direction
  scrollHideDelay: number
  scrollArea: ScrollAreaElement | null
  viewport: ScrollAreaViewportElement | null
  onViewportChange(viewport: ScrollAreaViewportElement | null): void
  content: HTMLDivElement | null
  onContentChange(content: HTMLDivElement): void
  scrollbarX: ScrollAreaScrollbarElement | null
  onScrollbarXChange(scrollbar: ScrollAreaScrollbarElement | null): void
  scrollbarXEnabled: boolean
  onScrollbarXEnabledChange(rendered: boolean): void
  scrollbarY: ScrollAreaScrollbarElement | null
  onScrollbarYChange(scrollbar: ScrollAreaScrollbarElement | null): void
  scrollbarYEnabled: boolean
  onScrollbarYEnabledChange(rendered: boolean): void
  onCornerWidthChange(width: number): void
  onCornerHeightChange(height: number): void
}

const ScrollAreaContext = createContext<ScrollAreaContextValue>(null as any)

const useScrollAreaContext = () => {
  const context = useContext(ScrollAreaContext)
  if (context === null) {
    throw new Error(`${SCROLL_AREA_NAME}: context is null`)
  }
  return context
}

type ScrollAreaElement = HTMLDivElement
type PrimitiveDivProps = HTMLAttributes<HTMLDivElement>
interface ScrollAreaProps extends PrimitiveDivProps {
  type?: ScrollAreaContextValue['type']
  dir?: ScrollAreaContextValue['dir']
  scrollSize?: number
  scrollHideDelay?: number
}

const ScrollArea = virtual<ScrollAreaProps>(
  (props) => {
    const {
      type = 'hover',
      dir,
      scrollSize = 10,
      scrollHideDelay = 600,
      ref: forwardedRef,
      ...scrollAreaProps
    } = props
    const [scrollArea, setScrollArea] = useState<ScrollAreaElement | null>(null)
    const [viewport, setViewport] = useState<ScrollAreaViewportElement | null>(null)
    const [content, setContent] = useState<HTMLDivElement | null>(null)
    const [scrollbarX, setScrollbarX] = useState<ScrollAreaScrollbarElement | null>(null)
    const [scrollbarY, setScrollbarY] = useState<ScrollAreaScrollbarElement | null>(null)
    const [cornerWidth, setCornerWidth] = useState(0)
    const [cornerHeight, setCornerHeight] = useState(0)
    const [scrollbarXEnabled, setScrollbarXEnabled] = useState(false)
    const [scrollbarYEnabled, setScrollbarYEnabled] = useState(false)
    const composedRefs = useComposedRefs(forwardedRef, node => setScrollArea(node))
    const direction = useDirection(dir)

    return ScrollAreaContext.Provider({
      value: {
        type: type,
        dir: direction,
        scrollHideDelay: scrollHideDelay,
        scrollArea: scrollArea,
        viewport: viewport,
        onViewportChange: setViewport,
        content: content,
        onContentChange: setContent,
        scrollbarX: scrollbarX,
        onScrollbarXChange: setScrollbarX,
        scrollbarXEnabled: scrollbarXEnabled,
        onScrollbarXEnabledChange: setScrollbarXEnabled,
        scrollbarY: scrollbarY,
        onScrollbarYChange: setScrollbarY,
        scrollbarYEnabled: scrollbarYEnabled,
        onScrollbarYEnabledChange: setScrollbarYEnabled,
        onCornerWidthChange: setCornerWidth,
        onCornerHeightChange: setCornerHeight,
      },
      children: html`<div dir=${direction} class=${`--scrollbar-size: ${scrollSize}px;`} ${spread(scrollAreaProps)} ref=${ref(composedRefs)} style=${styleMap({
        position: 'relative',
        ['--radix-scroll-area-corner-width' as any]: cornerWidth + 'px',
        ['--radix-scroll-area-corner-height' as any]: cornerHeight + 'px',
        ...props.style,
      })}></div>`
    })
  }
)


/* -------------------------------------------------------------------------------------------------
 * ScrollAreaViewport
 * -----------------------------------------------------------------------------------------------*/


type ScrollAreaViewportElement = HTMLDivElement
interface ScrollAreaViewportProps extends PrimitiveDivProps { }

const ScrollAreaViewport = virtual<ScrollAreaViewportProps>(
  (props) => {
    const { children, ref: forwardedRef, ...viewportProps } = props
    const context = useScrollAreaContext()
    const _ref = useRef<ScrollAreaViewportElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, _ref, context.onViewportChange)
    return [
      html`<style> ${unsafeHTML(`[data-radix-scroll-area-viewport] {
          position: relative;
          overflow: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }`)}</style>`,
      html`<div data-radix-scroll-area-viewport ${spread(viewportProps)} ref=${ref(composedRefs)} style=${styleMap({
        overflowX: context.scrollbarXEnabled ? 'scroll' : 'hidden',
        overflowY: context.scrollbarYEnabled ? 'scroll' : 'hidden',
        ...props.style
      })}>
        <div ref=${ref(context.onContentChange)} style="min-width:100%;display:table">${children}</div>
      </div>`
    ];
  },
)

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaScrollbar
 * -----------------------------------------------------------------------------------------------*/


type ScrollAreaScrollbarElement = ScrollAreaScrollbarVisibleElement
interface ScrollAreaScrollbarProps extends ScrollAreaScrollbarVisibleProps {
  forceMount?: true
}

const scrollbarStyles = [
  tw`flex select-none touch-none p-0.5 transition-[background] duration-150 ease-out`,
  css`
    background: rgb(0 0 0 / 0.114);

    &:hover {
      background: rgb(0 0 0 / 0.22);
    }

    &[data-orientation='vertical'] {
      width: var(--scrollbar-size);
    }

    &[data-orientation='horizontal'] {
      flex-direction: column;
      height: var(--scrollbar-size);
    }
  `,
]

const ScrollAreaScrollbar = virtual<ScrollAreaScrollbarProps>((props) => {
  const { forceMount, ref: forwardedRef, ...scrollbarProps } = props
  const context = useScrollAreaContext()
  const { onScrollbarXEnabledChange, onScrollbarYEnabledChange } = context
  const isHorizontal = props.orientation === 'horizontal'

  useEffect(() => {
    isHorizontal ? onScrollbarXEnabledChange(true) : onScrollbarYEnabledChange(true)
    return () => {
      isHorizontal ? onScrollbarXEnabledChange(false) : onScrollbarYEnabledChange(false)
    }
  }, [isHorizontal, onScrollbarXEnabledChange, onScrollbarYEnabledChange])

  return context.type === 'hover' ? ScrollAreaScrollbarHover({
    className: css(scrollbarStyles),
    ...scrollbarProps,
    ref: forwardedRef,
    forceMount
  }) : context.type === 'scroll' ? ScrollAreaScrollbarScroll({
    className: css(scrollbarStyles),
    ...scrollbarProps,
    ref: forwardedRef,
    forceMount
  }) : context.type === 'auto' ? ScrollAreaScrollbarAuto({
    className: css(scrollbarStyles),
    ...scrollbarProps,
    ref: forwardedRef,
    forceMount
  }) : context.type === 'always' ? ScrollAreaScrollbarVisible({
    className: css(scrollbarStyles),
    ...scrollbarProps,
    ref: forwardedRef
  }) : null
})


interface ScrollAreaScrollbarHoverProps extends ScrollAreaScrollbarAutoProps {
  forceMount?: true
}

const ScrollAreaScrollbarHover = virtual<ScrollAreaScrollbarHoverProps>((props) => {
  const { forceMount, ref: forwardedRef, ...scrollbarProps } = props
  const context = useScrollAreaContext()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const scrollArea = context.scrollArea
    let hideTimer = 0
    if (scrollArea) {
      const handlePointerEnter = () => {
        window.clearTimeout(hideTimer)
        setVisible(true)
      }
      const handlePointerLeave = () => {
        hideTimer = window.setTimeout(() => setVisible(false), context.scrollHideDelay)
      }
      scrollArea.addEventListener('pointerenter', handlePointerEnter)
      scrollArea.addEventListener('pointerleave', handlePointerLeave)
      return () => {
        window.clearTimeout(hideTimer)
        scrollArea.removeEventListener('pointerenter', handlePointerEnter)
        scrollArea.removeEventListener('pointerleave', handlePointerLeave)
      }
    }
  }, [context.scrollArea, context.scrollHideDelay])

  return Presence({
    present: forceMount || visible,
    children: ScrollAreaScrollbarAuto({
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    })
  })
})

interface ScrollAreaScrollbarScrollProps extends ScrollAreaScrollbarVisibleProps {
  forceMount?: true
}

const ScrollAreaScrollbarScroll = virtual<ScrollAreaScrollbarScrollProps>((props) => {
  const { forceMount, ref: forwardedRef, ...scrollbarProps } = props
  const context = useScrollAreaContext()
  const isHorizontal = props.orientation === 'horizontal'
  const debounceScrollEnd = useDebounceCallback(() => send('SCROLL_END'), 100)
  const [state, send] = useStateMachine('hidden', {
    hidden: {
      SCROLL: 'scrolling',
    },
    scrolling: {
      SCROLL_END: 'idle',
      POINTER_ENTER: 'interacting',
    },
    interacting: {
      SCROLL: 'interacting',
      POINTER_LEAVE: 'idle',
    },
    idle: {
      HIDE: 'hidden',
      SCROLL: 'scrolling',
      POINTER_ENTER: 'interacting',
    },
  })

  useEffect(() => {
    if (state === 'idle') {
      const hideTimer = window.setTimeout(() => send('HIDE'), context.scrollHideDelay)
      return () => window.clearTimeout(hideTimer)
    }
  }, [state, context.scrollHideDelay, send])

  useEffect(() => {
    const viewport = context.viewport
    const scrollDirection = isHorizontal ? 'scrollLeft' : 'scrollTop'

    if (viewport) {
      let prevScrollPos = viewport[scrollDirection]
      const handleScroll = () => {
        const scrollPos = viewport[scrollDirection]
        const hasScrollInDirectionChanged = prevScrollPos !== scrollPos
        if (hasScrollInDirectionChanged) {
          send('SCROLL')
          debounceScrollEnd()
        }
        prevScrollPos = scrollPos
      }
      viewport.addEventListener('scroll', handleScroll)
      return () => viewport.removeEventListener('scroll', handleScroll)
    }
  }, [context.viewport, isHorizontal, send, debounceScrollEnd])

  return Presence({
    present: forceMount || state !== 'hidden',
    children: ScrollAreaScrollbarVisible({
      "data-state": state === 'hidden' ? 'hidden' : 'visible',
      ...scrollbarProps,
      ref: forwardedRef,
      onPointerEnter: composeEventHandlers(props.onPointerEnter, () => send('POINTER_ENTER')),
      onPointerLeave: composeEventHandlers(props.onPointerLeave, () => send('POINTER_LEAVE')),
    })
  })
})

type ScrollAreaScrollbarAutoElement = ScrollAreaScrollbarVisibleElement
interface ScrollAreaScrollbarAutoProps extends ScrollAreaScrollbarVisibleProps {
  forceMount?: true
}

const ScrollAreaScrollbarAuto = virtual<ScrollAreaScrollbarAutoProps>((props) => {
  const context = useScrollAreaContext()
  const { forceMount, ref: forwardedRef, ...scrollbarProps } = props
  const [visible, setVisible] = useState(false)
  const isHorizontal = props.orientation === 'horizontal'
  const handleResize = useDebounceCallback(() => {
    if (context.viewport) {
      const isOverflowX = context.viewport.offsetWidth < context.viewport.scrollWidth
      const isOverflowY = context.viewport.offsetHeight < context.viewport.scrollHeight
      setVisible(isHorizontal ? isOverflowX : isOverflowY)
    }
  }, 10)

  useResizeObserver(context.viewport, handleResize)
  useResizeObserver(context.content, handleResize)

  return Presence({
    present: forceMount || visible,
    children: ScrollAreaScrollbarVisible({
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    })
  })
})

/* -----------------------------------------------------------------------------------------------*/

type ScrollAreaScrollbarVisibleElement = ScrollAreaScrollbarAxisElement
interface ScrollAreaScrollbarVisibleProps
  extends Omit<ScrollAreaScrollbarAxisProps, keyof ScrollAreaScrollbarAxisPrivateProps> {
  orientation?: 'horizontal' | 'vertical'
}

const ScrollAreaScrollbarVisible = virtual<ScrollAreaScrollbarVisibleProps>((props) => {
  const { orientation = 'vertical', ref: forwardedRef, ...scrollbarProps } = props
  const context = useScrollAreaContext()
  const thumbRef = useRef<ScrollAreaThumbElement | null>(null)
  const pointerOffsetRef = useRef(0)
  const [sizes, setSizes] = useState<Sizes>({
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 },
  })
  const thumbRatio = getThumbRatio(sizes.viewport, sizes.content)

  type UncommonProps = 'onThumbPositionChange' | 'onDragScroll' | 'onWheelScroll'
  const commonProps: Omit<ScrollAreaScrollbarAxisPrivateProps, UncommonProps> = {
    ...scrollbarProps,
    sizes,
    onSizesChange: setSizes,
    hasThumb: Boolean(thumbRatio > 0 && thumbRatio < 1),
    onThumbChange: thumb => (thumbRef.current = thumb),
    onThumbPointerUp: () => (pointerOffsetRef.current = 0),
    onThumbPointerDown: pointerPos => (pointerOffsetRef.current = pointerPos),
  }

  function getScrollPosition(pointerPos: number, dir?: Direction) {
    return getScrollPositionFromPointer(pointerPos, pointerOffsetRef.current, sizes, dir)
  }

  if (orientation === 'horizontal') {
    return ScrollAreaScrollbarX({
      ...commonProps,
      ref: forwardedRef,
      onThumbPositionChange: () => {
        if (context.viewport && thumbRef.current) {
          const scrollPos = context.viewport.scrollLeft
          const offset = getThumbOffsetFromScroll(scrollPos, sizes, context.dir)
          thumbRef.current.style.transform = `translate3d(${offset}px, 0, 0)`
        }
      },
      onWheelScroll: scrollPos => {
        if (context.viewport) context.viewport.scrollLeft = scrollPos
      },
      onDragScroll: pointerPos => {
        if (context.viewport) context.viewport.scrollLeft = getScrollPosition(pointerPos, context.dir)
      },
    })
  }

  if (orientation === 'vertical') {
    return ScrollAreaScrollbarY({
      ...commonProps,
      ref: forwardedRef,
      onThumbPositionChange: () => {
        if (context.viewport && thumbRef.current) {
          const scrollPos = context.viewport.scrollTop
          const offset = getThumbOffsetFromScroll(scrollPos, sizes)
          thumbRef.current.style.transform = `translate3d(0, ${offset}px, 0)`
        }
      },
      onWheelScroll: scrollPos => {
        if (context.viewport) context.viewport.scrollTop = scrollPos
      },
      onDragScroll: pointerPos => {
        if (context.viewport) context.viewport.scrollTop = getScrollPosition(pointerPos)
      },
    })
  }

  return null
})

/* -----------------------------------------------------------------------------------------------*/

type ScrollAreaScrollbarAxisPrivateProps = {
  hasThumb: boolean
  sizes: Sizes
  onSizesChange(sizes: Sizes): void
  onThumbChange(thumb: ScrollAreaThumbElement | null): void
  onThumbPointerDown(pointerPos: number): void
  onThumbPointerUp(): void
  onThumbPositionChange(): void
  onWheelScroll(scrollPos: number): void
  onDragScroll(pointerPos: number): void
}

type ScrollAreaScrollbarAxisElement = ScrollAreaScrollbarImplElement
interface ScrollAreaScrollbarAxisProps
  extends Omit<ScrollAreaScrollbarImplProps, keyof ScrollAreaScrollbarImplPrivateProps>,
  ScrollAreaScrollbarAxisPrivateProps { }

const ScrollAreaScrollbarX = virtual<ScrollAreaScrollbarAxisProps>((props) => {
  const { sizes, onSizesChange, ref: forwardedRef, ...scrollbarProps } = props
  const context = useScrollAreaContext()
  const [computedStyle, setComputedStyle] = useState<CSSStyleDeclaration>()
  const ref = useRef<ScrollAreaScrollbarAxisElement>(null)
  const composeRefs = useComposedRefs(forwardedRef, ref, context.onScrollbarXChange)

  useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current))
  }, [ref])

  return ScrollAreaScrollbarImpl({
    'data-orientation': 'horizontal',
    ...scrollbarProps,
    ref: composeRefs,
    sizes,
    style: {
      bottom: 0,
      left: context.dir === 'rtl' ? 'var(--radix-scroll-area-corner-width)' : 0,
      right: context.dir === 'ltr' ? 'var(--radix-scroll-area-corner-width)' : 0,
      ['--radix-scroll-area-thumb-width' as any]: getThumbSize(sizes) + 'px',
      ...props.style,
    },
    onThumbPointerDown: pointerPos => props.onThumbPointerDown(pointerPos.x),
    onDragScroll: pointerPos => props.onDragScroll(pointerPos.x),
    onWheelScroll: (event, maxScrollPos) => {
      if (context.viewport) {
        const scrollPos = context.viewport.scrollLeft + event.deltaX
        props.onWheelScroll(scrollPos)
        // prevent window scroll when wheeling on scrollbar
        if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
          event.preventDefault()
        }
      }
    },
    onResize: () => {
      if (ref.current && context.viewport && computedStyle) {
        onSizesChange({
          content: context.viewport.scrollWidth,
          viewport: context.viewport.offsetWidth,
          scrollbar: {
            size: ref.current.clientWidth,
            paddingStart: toInt(computedStyle.paddingLeft),
            paddingEnd: toInt(computedStyle.paddingRight),
          },
        })
      }
    },
  })
})

const ScrollAreaScrollbarY = virtual<ScrollAreaScrollbarAxisProps>((props) => {
  const { sizes, onSizesChange, ref: forwardedRef, ...scrollbarProps } = props
  const context = useScrollAreaContext()
  const [computedStyle, setComputedStyle] = useState<CSSStyleDeclaration>()
  const ref = useRef<ScrollAreaScrollbarAxisElement>(null)
  const composeRefs = useComposedRefs(forwardedRef, ref, context.onScrollbarYChange)

  useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current))
  }, [ref])

  return ScrollAreaScrollbarImpl({
    'data-orientation': 'vertical',
    ...scrollbarProps,
    ref: composeRefs,
    sizes,
    style: {
      top: 0,
      right: context.dir === 'ltr' ? 0 : undefined,
      left: context.dir === 'rtl' ? 0 : undefined,
      bottom: 'var(--radix-scroll-area-corner-height)',
      ['--radix-scroll-area-thumb-height' as any]: getThumbSize(sizes) + 'px',
      ...props.style,
    },
    onThumbPointerDown: pointerPos => props.onThumbPointerDown(pointerPos.y),
    onDragScroll: pointerPos => props.onDragScroll(pointerPos.y),
    onWheelScroll: (event, maxScrollPos) => {
      if (context.viewport) {
        const scrollPos = context.viewport.scrollTop + event.deltaY
        props.onWheelScroll(scrollPos)
        // prevent window scroll when wheeling on scrollbar
        if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
          event.preventDefault()
        }
      }
    },
    onResize: () => {
      if (ref.current && context.viewport && computedStyle) {
        onSizesChange({
          content: context.viewport.scrollHeight,
          viewport: context.viewport.offsetHeight,
          scrollbar: {
            size: ref.current.clientHeight,
            paddingStart: toInt(computedStyle.paddingTop),
            paddingEnd: toInt(computedStyle.paddingBottom),
          },
        })
      }
    },
  })
})

/* -----------------------------------------------------------------------------------------------*/

type ScrollbarContext = {
  hasThumb: boolean
  scrollbar: ScrollAreaScrollbarElement | null
  onThumbChange(thumb: ScrollAreaThumbElement | null): void
  onThumbPointerUp(): void
  onThumbPointerDown(pointerPos: { x: number; y: number }): void
  onThumbPositionChange(): void
}

const ScrollbarContext = createContext<ScrollbarContext>(null as any)
const useScrollbarContext = () => useContext(ScrollbarContext)

type ScrollAreaScrollbarImplElement = HTMLDivElement
type ScrollAreaScrollbarImplPrivateProps = {
  sizes: Sizes
  hasThumb: boolean
  onThumbChange: ScrollbarContext['onThumbChange']
  onThumbPointerUp: ScrollbarContext['onThumbPointerUp']
  onThumbPointerDown: ScrollbarContext['onThumbPointerDown']
  onThumbPositionChange: ScrollbarContext['onThumbPositionChange']
  onWheelScroll(event: WheelEvent, maxScrollPos: number): void
  onDragScroll(pointerPos: { x: number; y: number }): void
  onResize(): void
}
type ScrollAreaScrollbarImplProps = PrimitiveDivProps & ScrollAreaScrollbarImplPrivateProps

const ScrollAreaScrollbarImpl = virtual<
  ScrollAreaScrollbarImplProps
>((props) => {
  const {
    sizes,
    hasThumb,
    onThumbChange,
    onThumbPointerUp,
    onThumbPointerDown,
    onThumbPositionChange,
    onDragScroll,
    onWheelScroll,
    onResize,
    ref: forwardedRef,
    ...scrollbarProps
  } = props
  const context = useScrollAreaContext()
  const [scrollbar, setScrollbar] = useState<ScrollAreaScrollbarElement | null>(null)
  const composeRefs = useComposedRefs(forwardedRef, node => setScrollbar(node))
  const rectRef = useRef<ClientRect | null>(null)
  const prevWebkitUserSelectRef = useRef<string>('')
  const viewport = context.viewport
  const maxScrollPos = sizes.content - sizes.viewport
  const handleWheelScroll = useCallbackRef(onWheelScroll)
  const handleThumbPositionChange = useCallbackRef(onThumbPositionChange)
  const handleResize = useDebounceCallback(onResize, 10)

  function handleDragScroll(event: PointerEvent) {
    if (rectRef.current) {
      const x = event.clientX - rectRef.current.left
      const y = event.clientY - rectRef.current.top
      onDragScroll({ x, y })
    }
  }

  /**
   * We bind wheel event imperatively so we can switch off passive
   * mode for document wheel event to allow it to be prevented
   */
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const element = event.target as HTMLElement
      const isScrollbarWheel = scrollbar?.contains(element)
      if (isScrollbarWheel) handleWheelScroll(event, maxScrollPos)
    }
    document.addEventListener('wheel', handleWheel, { passive: false })
    return () => document.removeEventListener('wheel', handleWheel, { passive: false } as any)
  }, [viewport, scrollbar, maxScrollPos, handleWheelScroll])

  /**
   * Update thumb position on sizes change
   */
  useEffect(handleThumbPositionChange, [sizes, handleThumbPositionChange])

  useResizeObserver(scrollbar, handleResize)
  useResizeObserver(context.content, handleResize)

  return ScrollbarContext.Provider({
    value: {
      scrollbar: scrollbar,
      hasThumb: hasThumb,
      onThumbChange: useCallbackRef(onThumbChange),
      onThumbPointerUp: useCallbackRef(onThumbPointerUp),
      onThumbPositionChange: handleThumbPositionChange,
      onThumbPointerDown: useCallbackRef(onThumbPointerDown),
    },
    children: html`<div ${spread(scrollbarProps)} ref=${ref(composeRefs)} style=${styleMap({
      position: 'absolute', ...scrollbarProps.style
    })}
    @pointerdown=${composeEventHandlers(props.onPointerDown, event => {
      const mainPointer = 0
      if (event.button === mainPointer) {
        const element = event.target as HTMLElement
        element.setPointerCapture(event.pointerId)
        rectRef.current = scrollbar!.getBoundingClientRect()
        // pointer capture doesn't prevent text selection in Safari
        // so we remove text selection manually when scrolling
        prevWebkitUserSelectRef.current = document.body.style.webkitUserSelect
        document.body.style.webkitUserSelect = 'none'
        handleDragScroll(event)
      }
    })}
    @pointermove=${composeEventHandlers(props.onPointerMove, handleDragScroll)}
    @pointerup=${composeEventHandlers(props.onPointerUp, event => {
      const element = event.target as HTMLElement
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId)
      }
      document.body.style.webkitUserSelect = prevWebkitUserSelectRef.current
      rectRef.current = null
    })}
    ></div>`
  })
})

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaThumb
 * -----------------------------------------------------------------------------------------------*/


type ScrollAreaThumbElement = ScrollAreaThumbImplElement
interface ScrollAreaThumbProps extends ScrollAreaThumbImplProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true
}

const ScrollAreaThumb = virtual<ScrollAreaThumbProps>(
  (props) => {
    const { forceMount, ref: forwardedRef, ...thumbProps } = props
    const scrollbarContext = useScrollbarContext()
    return Presence({
      present: forceMount || scrollbarContext.hasThumb,
      children: ScrollAreaThumbImpl({
        ref: forwardedRef,
        className: css([
          tw`flex relative flex-1`,
          css`
              background-color: rgb(134, 132, 141);
              border-radius: var(--scrollbar-size);

              &:before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                height: 100%;
                min-width: 44px;
                min-height: 44px;
              }
            `,
        ]),
        ...thumbProps
      })
    })
  })


type ScrollAreaThumbImplElement = HTMLDivElement
interface ScrollAreaThumbImplProps extends PrimitiveDivProps { }

const ScrollAreaThumbImpl = virtual<ScrollAreaThumbImplProps>(
  (props) => {
    const { style, ref: forwardedRef, ...thumbProps } = props
    const scrollAreaContext = useScrollAreaContext()
    const scrollbarContext = useScrollbarContext()
    const { onThumbPositionChange } = scrollbarContext
    const composedRef = useComposedRefs(forwardedRef, node => scrollbarContext.onThumbChange(node))
    const removeUnlinkedScrollListenerRef = useRef<() => void>()
    const debounceScrollEnd = useDebounceCallback(() => {
      if (removeUnlinkedScrollListenerRef.current) {
        removeUnlinkedScrollListenerRef.current()
        removeUnlinkedScrollListenerRef.current = undefined
      }
    }, 100)

    useEffect(() => {
      const viewport = scrollAreaContext.viewport
      if (viewport) {
        /**
         * We only bind to native scroll event so we know when scroll starts and ends.
         * When scroll starts we start a requestAnimationFrame loop that checks for
         * changes to scroll position. That rAF loop triggers our thumb position change
         * when relevant to avoid scroll-linked effects. We cancel the loop when scroll ends.
         * https://developer.mozilla.org/en-US/docs/Mozilla/Performance/Scroll-linked_effects
         */
        const handleScroll = () => {
          debounceScrollEnd()
          if (!removeUnlinkedScrollListenerRef.current) {
            const listener = addUnlinkedScrollListener(viewport, onThumbPositionChange)
            removeUnlinkedScrollListenerRef.current = listener
            onThumbPositionChange()
          }
        }
        onThumbPositionChange()
        viewport.addEventListener('scroll', handleScroll)
        return () => viewport.removeEventListener('scroll', handleScroll)
      }
    }, [scrollAreaContext.viewport, debounceScrollEnd, onThumbPositionChange])

    return html`<div data-state="${scrollbarContext.hasThumb ? 'visible' : 'hidden'}" ${spread(thumbProps)} ref=${ref(composedRef)}
    style=${styleMap({
      width: 'var(--radix-scroll-area-thumb-width)',
      height: 'var(--radix-scroll-area-thumb-height)',
      ...style,
    })}
    @pointerdown=${composeEventHandlers(props.onPointerDownCapture, event => {
      const thumb = event.target as HTMLElement
      const thumbRect = thumb.getBoundingClientRect()
      const x = event.clientX - thumbRect.left
      const y = event.clientY - thumbRect.top
      scrollbarContext.onThumbPointerDown({ x, y })
    })}
    @pointerup=${composeEventHandlers(props.onPointerUp, scrollbarContext.onThumbPointerUp)}
    ></div>`
  },
)


/* -------------------------------------------------------------------------------------------------
 * ScrollAreaCorner
 * -----------------------------------------------------------------------------------------------*/


interface ScrollAreaCornerProps extends ScrollAreaCornerImplProps { }

const ScrollAreaCorner = virtual<ScrollAreaCornerProps>(
  (props) => {
    const context = useScrollAreaContext()
    const hasBothScrollbarsVisible = Boolean(context.scrollbarX && context.scrollbarY)
    const hasCorner = context.type !== 'scroll' && hasBothScrollbarsVisible
    return hasCorner ? ScrollAreaCornerImpl(props) : null
  },
)

/* -----------------------------------------------------------------------------------------------*/

type ScrollAreaCornerImplElement = HTMLDivElement
interface ScrollAreaCornerImplProps extends PrimitiveDivProps { }

const ScrollAreaCornerImpl = virtual<ScrollAreaCornerImplProps>((props) => {
  const context = useScrollAreaContext()
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const hasSize = Boolean(width && height)

  useResizeObserver(context.scrollbarX, () => {
    const height = context.scrollbarX?.offsetHeight || 0
    context.onCornerHeightChange(height)
    setHeight(height)
  })

  useResizeObserver(context.scrollbarY, () => {
    const width = context.scrollbarY?.offsetWidth || 0
    context.onCornerWidthChange(width)
    setWidth(width)
  })

  return hasSize ? html`<div ${spread(props)} style=${styleMap({
    width,
    height,
    position: 'absolute',
    right: context.dir === 'ltr' ? 0 : undefined,
    left: context.dir === 'rtl' ? 0 : undefined,
    bottom: 0,
    ...props.style,
  })}></div>` : null
})

/* -----------------------------------------------------------------------------------------------*/

function toInt(value?: string) {
  return value ? parseInt(value, 10) : 0
}

function getThumbRatio(viewportSize: number, contentSize: number) {
  const ratio = viewportSize / contentSize
  return isNaN(ratio) ? 0 : ratio
}

function getThumbSize(sizes: Sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content)
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio
  // minimum of 18 matches macOS minimum
  return Math.max(thumbSize, 18)
}

function getScrollPositionFromPointer(
  pointerPos: number,
  pointerOffset: number,
  sizes: Sizes,
  dir: Direction = 'ltr',
) {
  const thumbSizePx = getThumbSize(sizes)
  const thumbCenter = thumbSizePx / 2
  const offset = pointerOffset || thumbCenter
  const thumbOffsetFromEnd = thumbSizePx - offset
  const minPointerPos = sizes.scrollbar.paddingStart + offset
  const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd
  const maxScrollPos = sizes.content - sizes.viewport
  const scrollRange = dir === 'ltr' ? [0, maxScrollPos] : [maxScrollPos * -1, 0]
  const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange as [number, number])
  return interpolate(pointerPos)
}

function getThumbOffsetFromScroll(scrollPos: number, sizes: Sizes, dir: Direction = 'ltr') {
  const thumbSizePx = getThumbSize(sizes)
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd
  const scrollbar = sizes.scrollbar.size - scrollbarPadding
  const maxScrollPos = sizes.content - sizes.viewport
  const maxThumbPos = scrollbar - thumbSizePx
  const scrollClampRange = dir === 'ltr' ? [0, maxScrollPos] : [maxScrollPos * -1, 0]
  const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange as [number, number])
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos])
  return interpolate(scrollWithoutMomentum)
}

// https://github.com/tmcw-up-for-adoption/simple-linear-scale/blob/master/index.js
function linearScale(input: readonly [number, number], output: readonly [number, number]) {
  return (value: number) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0]
    const ratio = (output[1] - output[0]) / (input[1] - input[0])
    return output[0] + ratio * (value - input[0])
  }
}

function isScrollingWithinScrollbarBounds(scrollPos: number, maxScrollPos: number) {
  return scrollPos > 0 && scrollPos < maxScrollPos
}

// Custom scroll handler to avoid scroll-linked effects
// https://developer.mozilla.org/en-US/docs/Mozilla/Performance/Scroll-linked_effects
const addUnlinkedScrollListener = (node: HTMLElement, handler = () => { }) => {
  let prevPosition = { left: node.scrollLeft, top: node.scrollTop }
  let rAF = 0
    ; (function loop() {
      const position = { left: node.scrollLeft, top: node.scrollTop }
      const isHorizontalScroll = prevPosition.left !== position.left
      const isVerticalScroll = prevPosition.top !== position.top
      if (isHorizontalScroll || isVerticalScroll) handler()
      prevPosition = position
      rAF = window.requestAnimationFrame(loop)
    })()
  return () => window.cancelAnimationFrame(rAF)
}

function useDebounceCallback(callback: () => void, delay: number) {
  const handleCallback = useCallbackRef(callback)
  const debounceTimerRef = useRef(0)
  useEffect(() => () => window.clearTimeout(debounceTimerRef.current), [])
  return useCallback(() => {
    window.clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = window.setTimeout(handleCallback, delay)
  }, [handleCallback, delay])
}

function useResizeObserver(element: HTMLElement | null, onResize: () => void) {
  const handleResize = useCallbackRef(onResize)
  useIsomorphicLayoutEffect(() => {
    let rAF = 0
    if (element) {
      /**
       * Resize Observer will throw an often benign error that says `ResizeObserver loop
       * completed with undelivered notifications`. This means that ResizeObserver was not
       * able to deliver all observations within a single animation frame, so we use
       * `requestAnimationFrame` to ensure we don't deliver unnecessary observations.
       * Further reading: https://github.com/WICG/resize-observer/issues/38
       */
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF)
        rAF = window.requestAnimationFrame(handleResize)
      })
      resizeObserver.observe(element)
      return () => {
        window.cancelAnimationFrame(rAF)
        resizeObserver.unobserve(element)
      }
    }
  }, [element, handleResize])
}

/* -----------------------------------------------------------------------------------------------*/

export {
  //
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
}
export type {
  ScrollAreaProps,
  ScrollAreaViewportProps,
  ScrollAreaScrollbarProps,
  ScrollAreaThumbProps,
  ScrollAreaCornerProps,
}
