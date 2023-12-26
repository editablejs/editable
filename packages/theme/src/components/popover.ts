
import { Popper, PopperAnchor, PopperAnchorProps, PopperArrow, PopperArrowProps, PopperContent, PopperContentProps } from './popper'
import { useId } from '@/hooks/use-id'
import { useComposedRefs } from './compose-refs'
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'
import { composeEventHandlers } from '@/utils'
import { Portal, PortalProps } from './portal'
import { Presence } from './presence'
import { DismissableLayer, DismissableLayerProps } from './dismissable-layer'
import { PointerOpenOptions, usePointerOpen } from '@/hooks/use-pointer-open'
import { MutableRefObject, createContext, useContext, useState, useRef, useCallback, useEffect, c, html, ButtonHTMLAttributes } from 'rezon'
import { ref } from 'rezon/directives/ref'
import tw, { css } from 'twin.macro'
import { spread } from 'rezon/directives/spread'
import { when } from 'rezon/directives/when'
import { Slot } from './slot'

/* -------------------------------------------------------------------------------------------------
 * Popover
 * -----------------------------------------------------------------------------------------------*/
type PopoverContextValue = {
  trigger: HTMLButtonElement | null
  onTriggerChange(trigger: HTMLButtonElement | null): void
  onContentChange(trigger: HTMLDivElement | null): void
  contentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  hasCustomAnchor: boolean
  onCustomAnchorAdd(): void
  onCustomAnchorRemove(): void
  onDismiss(): void
  addChildOpen?(content: MutableRefObject<boolean>): void
}

const PopoverContenxt = createContext<PopoverContextValue>(null as any)
const usePopoverContext = () => useContext(PopoverContenxt)
interface PopoverProps extends Omit<PointerOpenOptions, 'triggerEl' | 'contentEl'> {
  children?: unknown
}

const Popover = c<PopoverProps>((props) => {
  const { children, open: openProp, ...options } = props
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
  const [content, setContent] = useState<HTMLDivElement | null>(null)
  const openRef = useRef<boolean>(openProp ?? false)
  const [hasCustomAnchor, setHasCustomAnchor] = useState(false)
  const childOpens = useRef<MutableRefObject<boolean>[]>([])
  const parentContext = usePopoverContext()

  useIsomorphicLayoutEffect(() => {
    if (parentContext) {
      parentContext.addChildOpen?.(openRef)
    }
  }, [parentContext])

  const [open = false, setOpen] = usePointerOpen({
    open: openProp,
    triggerEl: trigger,
    contentEl: content,
    ...options,
    onOpenChange: open => {
      openRef.current = open
      options.onOpenChange?.(open)
    },
    getChildOpens: useCallback(() => {
      return childOpens.current.map(c => c.current)
    }, []),
  })

  return Popper({
    children: PopoverContenxt.Provider({
      value: {
        contentId: useId(),
        trigger,
        onTriggerChange: setTrigger,
        onContentChange: setContent,
        open,
        onOpenChange: setOpen,
        hasCustomAnchor,
        onCustomAnchorAdd: useCallback(() => setHasCustomAnchor(true), []),
        onCustomAnchorRemove: useCallback(() => setHasCustomAnchor(false), []),
        onDismiss: useCallback(() => setOpen(false), [setOpen]),
        addChildOpen: useCallback((open: MutableRefObject<boolean>) => {
          if (!childOpens.current.find(c => c === open)) childOpens.current.push(open)
        }, []),
      },
      children,
    })
  });
})


/* -------------------------------------------------------------------------------------------------
 * PopoverAnchor
 * -----------------------------------------------------------------------------------------------*/

interface PopoverAnchorProps extends PopperAnchorProps { }

const PopoverAnchor = c<PopoverAnchorProps>(
  (props) => {
    const context = usePopoverContext()
    const { onCustomAnchorAdd, onCustomAnchorRemove } = context

    useEffect(() => {
      onCustomAnchorAdd()
      return () => onCustomAnchorRemove()
    }, [onCustomAnchorAdd, onCustomAnchorRemove])

    return html`${PopperAnchor(props)}`
  },
)

/* -------------------------------------------------------------------------------------------------
 * PopoverTrigger
 * -----------------------------------------------------------------------------------------------*/
interface PrimitiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { }
interface PopoverTriggerProps extends PrimitiveButtonProps {
  asChild?: boolean
}

const PopoverTrigger = c<PopoverTriggerProps>(
  (props) => {
    const { ref: forwardedRef, asChild, ...triggerProps } = props
    const context = usePopoverContext()
    const composedTriggerRef = useComposedRefs(forwardedRef, context.onTriggerChange)

    const trigger = asChild ? Slot({ ...triggerProps, ref: forwardedRef }) : html`<button type=${context.hasCustomAnchor ? 'button' : undefined}
    aria-haspopup="dialog" aria-expanded=${context.open} aria-controls=${context.contentId} data-state=${getState(context.open)} ${spread(triggerProps)} ${ref(composedTriggerRef)}></button>`;

    return when(context.hasCustomAnchor, () => trigger, () => PopperAnchor({ children: trigger }))
  },
)

/* -------------------------------------------------------------------------------------------------
 * PopoverPortal
 * -----------------------------------------------------------------------------------------------*/

type PortalContextValue = { forceMount?: true }
const PortalContext = createContext<PortalContextValue>({ forceMount: undefined })
const usePortalContext = () => useContext(PortalContext)

interface PopoverPortalProps extends PortalProps {
  children?: unknown
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true
}

const PopoverPortal = c<PopoverPortalProps>((props: PopoverPortalProps) => {
  const { forceMount, children, container } = props
  const context = usePopoverContext()
  return PortalContext.Provider({
    value: { forceMount },
    children: Presence({
      present: forceMount || context.open,
      children: Portal({ container, children }),
    }),
  })
})

/* -------------------------------------------------------------------------------------------------
 * PopoverContent
 * -----------------------------------------------------------------------------------------------*/

interface PopoverContentProps extends PopoverContentTypeProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true
}

const PopoverContent = c<PopoverContentProps>(
  (props) => {
    const portalContext = usePortalContext()
    const { forceMount = portalContext.forceMount, ...contentProps } = props
    const context = usePopoverContext()
    return Presence({
      present: forceMount || context.open,
      children: PopoverContentNonModal(contentProps),
    })
  },
)

/* -----------------------------------------------------------------------------------------------*/

interface PopoverContentTypeProps
  extends Omit<PopoverContentImplProps, 'trapFocus' | 'disableOutsidePointerEvents'> { }

const PopoverContentNonModal = c<PopoverContentTypeProps>(
  (props) => {
    const context = usePopoverContext()
    const hasInteractedOutsideRef = useRef(false)

    return PopoverContentImpl({
      ...props,
      disableOutsidePointerEvents: false,
      onInteractOutside: event => {
        props.onInteractOutside?.(event)

        if (!event.defaultPrevented) hasInteractedOutsideRef.current = true

        // Prevent dismissing when clicking the trigger.
        // As the trigger is already setup to close, without doing so would
        // cause it to close and immediately open.
        //
        // We use `onInteractOutside` as some browsers also
        // focus on pointer down, creating the same issue.
        const target = event.target as HTMLElement
        const targetIsTrigger = context.trigger?.contains(target)
        if (targetIsTrigger) event.preventDefault()
      }
    });
  },
)

/* -----------------------------------------------------------------------------------------------*/


interface PopoverContentImplProps
  extends PopperContentProps,
  Omit<DismissableLayerProps, 'onDismiss'> { }

const PopoverContentImpl = c<PopoverContentImplProps>(
  (props) => {
    const {
      disableOutsidePointerEvents,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      ref: forwardedRef,
      ...contentProps
    } = props
    const context = usePopoverContext()

    const composedRefs = useComposedRefs(forwardedRef, context.onContentChange)

    return DismissableLayer({
      disableOutsidePointerEvents,
      onInteractOutside,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside: composeEventHandlers(onFocusOutside, event => {
        event.preventDefault()
      }),
      onDismiss: context.onDismiss,
      children: PopperContent({
        "data-state": getState(context.open),
        role: 'dialog',
        id: context.contentId,
        className: css(tw`z-50`),
        ...contentProps,
        ref: composedRefs,
        style: contentProps.style,
      }),
    })
  })


/* -------------------------------------------------------------------------------------------------
 * PopoverClose
 * -----------------------------------------------------------------------------------------------*/

interface PopoverCloseProps extends PrimitiveButtonProps { }

const PopoverClose = c<PopoverCloseProps>(
  (props) => {
    const { onClick, ...closeProps } = props
    const context = usePopoverContext()
    return html`<button type="button" ${spread(closeProps)} @click=${composeEventHandlers(onClick, () => context.onOpenChange(false))}></button>`;
  },
)


/* -------------------------------------------------------------------------------------------------
 * PopoverArrow
 * -----------------------------------------------------------------------------------------------*/

interface PopoverArrowProps extends PopperArrowProps { }

const PopoverArrow = c<PopoverArrowProps>(
  (props) => {
    return html`${PopperArrow(props)}`
  },
)

/* -----------------------------------------------------------------------------------------------*/

function getState(open: boolean) {
  return open ? 'open' : 'closed'
}

export {
  //
  Popover,
  PopoverAnchor,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverClose,
  PopoverArrow,
}
export type {
  PopoverProps,
  PopoverAnchorProps,
  PopoverTriggerProps,
  PopoverPortalProps,
  PopoverContentProps,
  PopoverCloseProps,
  PopoverArrowProps,
}
