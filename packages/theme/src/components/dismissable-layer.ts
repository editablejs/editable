import { useComposedRefs } from './compose-refs'
import { useEscapeKeydown } from '@/hooks/use-escape-keydown'
import { useCallbackRef } from '@/hooks/use-callback-ref'
import { composeEventHandlers, dispatchDiscreteCustomEvent } from '@/utils'
import { Slot } from './slot'
import { createContext, useContext, useState, useEffect, useRef, HTMLAttributes, virtual, html } from 'rezon'
import { spread } from 'rezon/directives/spread'
import { ref } from 'rezon/directives/ref'

/* -------------------------------------------------------------------------------------------------
 * DismissableLayer
 * -----------------------------------------------------------------------------------------------*/

const CONTEXT_UPDATE = 'dismissableLayer.update'
const POINTER_DOWN_OUTSIDE = 'dismissableLayer.pointerDownOutside'

let originalBodyPointerEvents: string

const DismissableLayerContext = createContext({
  layers: new Set<DismissableLayerElement>(),
  layersWithOutsidePointerEventsDisabled: new Set<DismissableLayerElement>(),
  branches: new Set<DismissableLayerBranchElement>(),
})

type DismissableLayerElement = HTMLDivElement

export interface DismissableLayerProps extends HTMLAttributes<DismissableLayerElement> {
  /**
   * When `true`, hover/focus/click interactions will be disabled on elements outside
   * the `DismissableLayer`. Users will need to click twice on outside elements to
   * interact with them: once to close the `DismissableLayer`, and again to trigger the element.
   */
  disableOutsidePointerEvents?: boolean
  /**
   * Event handler called when the escape key is down.
   * Can be prevented.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  /**
   * Event handler called when the a `pointerdown` event happens outside of the `DismissableLayer`.
   * Can be prevented.
   */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void
  /**
   * Event handler called when the focus moves outside of the `DismissableLayer`.
   * Can be prevented.
   */
  onFocusOutside?: (event: FocusOutsideEvent) => void
  /**
   * Event handler called when an interaction happens outside the `DismissableLayer`.
   * Specifically, when a `pointerdown` event happens outside or focus moves outside of it.
   * Can be prevented.
   */
  onInteractOutside?: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void
  /**
   * Handler called when the `DismissableLayer` should be dismissed
   */
  onDismiss?: () => void
}

const DismissableLayer = virtual<DismissableLayerProps>(
  (props) => {
    const {
      disableOutsidePointerEvents = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      ref: forwardedRef,
      ...layerProps
    } = props
    const context = useContext(DismissableLayerContext)
    const [node, setNode] = useState<DismissableLayerElement | null>(null)
    const [, force] = useState({})
    const composedRefs = useComposedRefs(forwardedRef, node => setNode(node))
    const layers = Array.from(context.layers)
    const [highestLayerWithOutsidePointerEventsDisabled] = [...context.layersWithOutsidePointerEventsDisabled].slice(-1); // prettier-ignore
    const highestLayerWithOutsidePointerEventsDisabledIndex = layers.indexOf(highestLayerWithOutsidePointerEventsDisabled); // prettier-ignore
    const index = node ? layers.indexOf(node) : -1
    const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0
    const isPointerEventsEnabled = index >= highestLayerWithOutsidePointerEventsDisabledIndex

    const pointerDownOutside = usePointerDownOutside(event => {
      const target = event.target as HTMLElement
      const isPointerDownOnBranch = [...context.branches].some(branch => branch.contains(target))
      if (!isPointerEventsEnabled || isPointerDownOnBranch) return
      onPointerDownOutside?.(event)
      onInteractOutside?.(event)
      if (!event.defaultPrevented) onDismiss?.()
    })

    const focusOutside = useFocusOutside(event => {
      const target = event.target as HTMLElement
      const isFocusInBranch = [...context.branches].some(branch => branch.contains(target))
      if (isFocusInBranch) return
      onFocusOutside?.(event)
      onInteractOutside?.(event)
      if (!event.defaultPrevented) onDismiss?.()
    })

    useEscapeKeydown(event => {
      const isHighestLayer = index === context.layers.size - 1
      if (!isHighestLayer) return
      onEscapeKeyDown?.(event)
      if (!event.defaultPrevented && onDismiss) {
        event.preventDefault()
        onDismiss()
      }
    })

    useEffect(() => {
      if (!node) return
      if (disableOutsidePointerEvents) {
        if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
          originalBodyPointerEvents = document.body.style.pointerEvents
          document.body.style.pointerEvents = 'none'
        }
        context.layersWithOutsidePointerEventsDisabled.add(node)
      }
      context.layers.add(node)
      dispatchUpdate()
      return () => {
        if (
          disableOutsidePointerEvents &&
          context.layersWithOutsidePointerEventsDisabled.size === 1
        ) {
          document.body.style.pointerEvents = originalBodyPointerEvents
        }
      }
    }, [node, disableOutsidePointerEvents, context])

    /**
     * We purposefully prevent combining this effect with the `disableOutsidePointerEvents` effect
     * because a change to `disableOutsidePointerEvents` would remove this layer from the stack
     * and add it to the end again so the layering order wouldn't be _creation order_.
     * We only want them to be removed from context stacks when unmounted.
     */
    useEffect(() => {
      return () => {
        if (!node) return
        context.layers.delete(node)
        context.layersWithOutsidePointerEventsDisabled.delete(node)
        dispatchUpdate()
      }
    }, [node, context])

    useEffect(() => {
      const handleUpdate = () => force({})
      document.addEventListener(CONTEXT_UPDATE, handleUpdate)
      return () => document.removeEventListener(CONTEXT_UPDATE, handleUpdate)
    }, [])

    return Slot({
      ...layerProps,
      ref: composedRefs,
      style: {
        pointerEvents: isBodyPointerEventsDisabled
          ? isPointerEventsEnabled
            ? 'auto'
            : 'none'
          : undefined,
        ...props.style,
      },
      onFocusCapture: composeEventHandlers(props.onFocusCapture, focusOutside.onFocusCapture),
      onBlurCapture: composeEventHandlers(props.onBlurCapture, focusOutside.onBlurCapture),
      onPointerDownCapture: composeEventHandlers(
        props.onPointerDownCapture,
        pointerDownOutside.onPointerDownCapture,
      ),
    })
  },
)


/* -------------------------------------------------------------------------------------------------
 * DismissableLayerBranch
 * -----------------------------------------------------------------------------------------------*/

type DismissableLayerBranchElement = HTMLDivElement
interface DismissableLayerBranchProps extends HTMLAttributes<DismissableLayerElement> { }

const DismissableLayerBranch = virtual<
  DismissableLayerBranchProps
>(({ ref: forwardedRef, ...props }) => {
  const context = useContext(DismissableLayerContext)
  const _ref = useRef<DismissableLayerBranchElement>(null)
  const composedRefs = useComposedRefs(forwardedRef, _ref)

  useEffect(() => {
    const node = _ref.current
    if (node) {
      context.branches.add(node)
      return () => {
        context.branches.delete(node)
      }
    }
  }, [context.branches])

  return html`<div ${spread(props)} ${ref(composedRefs)}></div>`
})

/* -----------------------------------------------------------------------------------------------*/

type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>
type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>

/**
 * Listens for `pointerdown` outside a react subtree. We use `pointerdown` rather than `pointerup`
 * to mimic layer dismissing behaviour present in OS.
 * Returns props to pass to the node we want to check for outside events.
 */
function usePointerDownOutside(onPointerDownOutside?: (event: PointerDownOutsideEvent) => void) {
  const handlePointerDownOutside = useCallbackRef(onPointerDownOutside) as EventListener
  const isPointerInsideReactTreeRef = useRef(false)
  const handleClickRef = useRef(() => { })

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target && !isPointerInsideReactTreeRef.current) {
        const eventDetail = { originalEvent: event }

        function handleAndDispatchPointerDownOutsideEvent() {
          handleAndDispatchCustomEvent(
            POINTER_DOWN_OUTSIDE,
            handlePointerDownOutside,
            eventDetail,
            { discrete: true },
          )
        }

        /**
         * On touch devices, we need to wait for a click event because browsers implement
         * a ~350ms delay between the time the user stops touching the display and when the
         * browser executres events. We need to ensure we don't reactivate pointer-events within
         * this timeframe otherwise the browser may execute events that should have been prevented.
         *
         * Additionally, this also lets us deal automatically with cancellations when a click event
         * isn't raised because the page was considered scrolled/drag-scrolled, long-pressed, etc.
         *
         * This is why we also continuously remove the previous listener, because we cannot be
         * certain that it was raised, and therefore cleaned-up.
         */
        if (event.pointerType === 'touch') {
          document.removeEventListener('click', handleClickRef.current)
          handleClickRef.current = handleAndDispatchPointerDownOutsideEvent
          document.addEventListener('click', handleClickRef.current, { once: true })
        } else {
          handleAndDispatchPointerDownOutsideEvent()
        }
      }
      isPointerInsideReactTreeRef.current = false
    }
    /**
     * if this hook executes in a component that mounts via a `pointerdown` event, the event
     * would bubble up to the document and trigger a `pointerDownOutside` event. We avoid
     * this by delaying the event listener registration on the document.
     * This is not React specific, but rather how the DOM works, ie:
     * ```
     * button.addEventListener('pointerdown', () => {
     *   console.log('I will log');
     *   document.addEventListener('pointerdown', () => {
     *     console.log('I will also log');
     *   })
     * });
     */
    const timerId = window.setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown)
    }, 0)
    return () => {
      window.clearTimeout(timerId)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('click', handleClickRef.current)
    }
  }, [handlePointerDownOutside])

  return {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => (isPointerInsideReactTreeRef.current = true),
  }
}

/**
 * Listens for when focus happens outside a react subtree.
 * Returns props to pass to the root (node) of the subtree we want to check.
 */
function useFocusOutside(onFocusOutside?: (event: FocusOutsideEvent) => void) {
  const isFocusInsideReactTreeRef = useRef(false)

  // useEffect(() => {
  //   const handleFocus = (event: FocusEvent) => {
  //     if (event.target && !isFocusInsideReactTreeRef.current) {
  //       const eventDetail = { originalEvent: event }
  //       handleAndDispatchCustomEvent(FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
  //         discrete: false,
  //       })
  //     }
  //   }
  //   document.addEventListener('focusin', handleFocus)
  //   return () => document.removeEventListener('focusin', handleFocus)
  // }, [handleFocusOutside])

  return {
    onFocusCapture: () => (isFocusInsideReactTreeRef.current = true),
    onBlurCapture: () => (isFocusInsideReactTreeRef.current = false),
  }
}

function dispatchUpdate() {
  const event = new CustomEvent(CONTEXT_UPDATE)
  document.dispatchEvent(event)
}

function handleAndDispatchCustomEvent<E extends CustomEvent, OriginalEvent extends Event>(
  name: string,
  handler: ((event: E) => void) | undefined,
  detail: { originalEvent: OriginalEvent } & (E extends CustomEvent<infer D> ? D : never),
  { discrete }: { discrete: boolean },
) {
  const target = detail.originalEvent.target
  const event = new CustomEvent(name, { bubbles: false, cancelable: true, detail })
  if (handler) target.addEventListener(name, handler as EventListener, { once: true })

  if (discrete) {
    dispatchDiscreteCustomEvent(target, event)
  } else {
    target.dispatchEvent(event)
  }
}

export { DismissableLayer, DismissableLayerBranch }
