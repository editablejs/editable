import * as React from 'react'
import { Popper, PopperAnchor, PopperArrow, PopperContent } from './popper'
import { useControllableState } from './hooks/use-controllable-state'
import { useId } from './hooks/use-id'
import { useComposedRefs } from './compose-refs'
import { composeEventHandlers } from './utils'
import { Portal } from './portal'
import { Presence } from './presence'
import { DismissableLayer } from './dismissable-layer'

function excludeTouch<E>(eventHandler: () => void) {
  return (event: React.PointerEvent<E>) =>
    event.pointerType === 'touch' ? undefined : eventHandler()
}

/* -------------------------------------------------------------------------------------------------
 * Popover
 * -----------------------------------------------------------------------------------------------*/

const POPOVER_NAME = 'Popover'

type PopoverContextValue = {
  triggerRef: React.RefObject<HTMLButtonElement>
  contentId: string
  open: boolean
  onOpenChange(open: boolean): void
  onOpenToggle(): void
  hasCustomAnchor: boolean
  onCustomAnchorAdd(): void
  onCustomAnchorRemove(): void
  onOpen(): void
  onClose(): void
  onDismiss(): void
  hasSelectionRef: React.MutableRefObject<boolean>
  isPointerDownOnContentRef: React.MutableRefObject<boolean>
}

const PopoverContenxt = React.createContext<PopoverContextValue>({} as any)
const usePopoverContext = () => React.useContext(PopoverContenxt)

type PopoverTrigger = 'click' | 'hover' | 'none'

interface PopoverProps {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  openDelay?: number
  closeDelay?: number
  trigger?: PopoverTrigger
}

const Popover: React.FC<PopoverProps> = (props: PopoverProps) => {
  const {
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    openDelay,
    closeDelay,
    trigger,
  } = props
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [hasCustomAnchor, setHasCustomAnchor] = React.useState(false)
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  })

  const openTimerRef = React.useRef(0)
  const closeTimerRef = React.useRef(0)
  const hasSelectionRef = React.useRef(false)
  const isPointerDownOnContentRef = React.useRef(false)

  const disableTrigger = (t: PopoverTrigger) => {
    if (trigger === undefined) return false
    if (trigger === 'none') return true
    return t !== trigger
  }

  const handleOpen = React.useCallback(() => {
    if (disableTrigger('hover')) return
    clearTimeout(closeTimerRef.current)
    openTimerRef.current = window.setTimeout(() => setOpen(true), openDelay)
  }, [openDelay, setOpen])

  const handleClose = React.useCallback(() => {
    if (disableTrigger('hover')) return
    clearTimeout(openTimerRef.current)
    if (!hasSelectionRef.current && !isPointerDownOnContentRef.current) {
      closeTimerRef.current = window.setTimeout(() => setOpen(false), closeDelay)
    }
  }, [closeDelay, setOpen])

  const handleDismiss = React.useCallback(() => setOpen(false), [setOpen])

  const handleToggle = React.useCallback(() => {
    if (disableTrigger('click')) return
    setOpen(prevOpen => !prevOpen)
  }, [setOpen])

  return (
    <Popper>
      <PopoverContenxt.Provider
        value={{
          contentId: useId(),
          triggerRef: triggerRef,
          open,
          onOpenChange: setOpen,
          onOpenToggle: handleToggle,
          hasCustomAnchor,
          onCustomAnchorAdd: React.useCallback(() => setHasCustomAnchor(true), []),
          onCustomAnchorRemove: React.useCallback(() => setHasCustomAnchor(false), []),
          onOpen: handleOpen,
          onClose: handleClose,
          onDismiss: handleDismiss,
          hasSelectionRef: hasSelectionRef,
          isPointerDownOnContentRef: isPointerDownOnContentRef,
        }}
      >
        {children}
      </PopoverContenxt.Provider>
    </Popper>
  )
}

Popover.displayName = POPOVER_NAME

/* -------------------------------------------------------------------------------------------------
 * PopoverAnchor
 * -----------------------------------------------------------------------------------------------*/

const ANCHOR_NAME = 'PopoverAnchor'

type PopoverAnchorElement = React.ElementRef<typeof PopperAnchor>
type PopperAnchorProps = React.ComponentPropsWithoutRef<typeof PopperAnchor>
interface PopoverAnchorProps extends PopperAnchorProps {}

const PopoverAnchor = React.forwardRef<PopoverAnchorElement, PopoverAnchorProps>(
  (props: PopoverAnchorProps, forwardedRef) => {
    const context = usePopoverContext()
    const { onCustomAnchorAdd, onCustomAnchorRemove } = context

    React.useEffect(() => {
      onCustomAnchorAdd()
      return () => onCustomAnchorRemove()
    }, [onCustomAnchorAdd, onCustomAnchorRemove])

    return <PopperAnchor {...props} ref={forwardedRef} />
  },
)

PopoverAnchor.displayName = ANCHOR_NAME

/* -------------------------------------------------------------------------------------------------
 * PopoverTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'PopoverTrigger'

type PopoverTriggerElement = React.ElementRef<'button'>
type PrimitiveButtonProps = React.ComponentPropsWithoutRef<'button'>
interface PopoverTriggerProps extends PrimitiveButtonProps {}

const PopoverTrigger = React.forwardRef<PopoverTriggerElement, PopoverTriggerProps>(
  (props: PopoverTriggerProps, forwardedRef) => {
    const { ...triggerProps } = props
    const context = usePopoverContext()
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef)

    const trigger = (
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={context.open}
        aria-controls={context.contentId}
        data-state={getState(context.open)}
        {...triggerProps}
        ref={composedTriggerRef}
        onClick={composeEventHandlers(props.onClick, context.onOpenToggle)}
        onPointerEnter={composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen))}
        onPointerLeave={composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose))}
        onTouchStart={composeEventHandlers(props.onTouchStart, event => event.preventDefault())}
      />
    )

    return context.hasCustomAnchor ? trigger : <PopperAnchor>{trigger}</PopperAnchor>
  },
)

PopoverTrigger.displayName = TRIGGER_NAME

/* -------------------------------------------------------------------------------------------------
 * PopoverPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'PopoverPortal'

type PortalContextValue = { forceMount?: true }
const PortalContext = React.createContext<PortalContextValue>({ forceMount: undefined })
const usePortalContext = () => React.useContext(PortalContext)

type PortalProps = React.ComponentPropsWithoutRef<typeof Portal>
interface PopoverPortalProps extends Omit<PortalProps, 'asChild'> {
  children?: React.ReactNode
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true
}

const PopoverPortal: React.FC<PopoverPortalProps> = (props: PopoverPortalProps) => {
  const { forceMount, children, container } = props
  const context = usePopoverContext()
  return (
    <PortalContext.Provider value={{ forceMount }}>
      <Presence present={forceMount || context.open}>
        <Portal container={container}>{children}</Portal>
      </Presence>
    </PortalContext.Provider>
  )
}

PopoverPortal.displayName = PORTAL_NAME

/* -------------------------------------------------------------------------------------------------
 * PopoverContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'PopoverContent'

interface PopoverContentProps extends PopoverContentTypeProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true
}

const PopoverContent = React.forwardRef<PopoverContentTypeElement, PopoverContentProps>(
  (props: PopoverContentProps, forwardedRef) => {
    const portalContext = usePortalContext()
    const { forceMount = portalContext.forceMount, ...contentProps } = props
    const context = usePopoverContext()
    return (
      <Presence present={forceMount || context.open}>
        <PopoverContentNonModal
          {...contentProps}
          ref={forwardedRef}
          onPointerEnter={composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen))}
          onPointerLeave={composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose))}
        />
      </Presence>
    )
  },
)

PopoverContent.displayName = CONTENT_NAME

/* -----------------------------------------------------------------------------------------------*/

type PopoverContentTypeElement = PopoverContentImplElement
interface PopoverContentTypeProps
  extends Omit<PopoverContentImplProps, 'trapFocus' | 'disableOutsidePointerEvents'> {}

const PopoverContentNonModal = React.forwardRef<PopoverContentTypeElement, PopoverContentTypeProps>(
  (props: PopoverContentTypeProps, forwardedRef) => {
    const context = usePopoverContext()
    const hasInteractedOutsideRef = React.useRef(false)

    return (
      <PopoverContentImpl
        {...props}
        ref={forwardedRef}
        disableOutsidePointerEvents={false}
        onInteractOutside={event => {
          props.onInteractOutside?.(event)

          if (!event.defaultPrevented) hasInteractedOutsideRef.current = true

          // Prevent dismissing when clicking the trigger.
          // As the trigger is already setup to close, without doing so would
          // cause it to close and immediately open.
          //
          // We use `onInteractOutside` as some browsers also
          // focus on pointer down, creating the same issue.
          const target = event.target as HTMLElement
          const targetIsTrigger = context.triggerRef.current?.contains(target)
          if (targetIsTrigger) event.preventDefault()
        }}
      />
    )
  },
)

PopoverContentNonModal.displayName = 'PopoverContentNonModal'
/* -----------------------------------------------------------------------------------------------*/

type PopoverContentImplElement = React.ElementRef<typeof PopperContent>
type DismissableLayerProps = React.ComponentPropsWithoutRef<typeof DismissableLayer>
type PopperContentProps = React.ComponentPropsWithoutRef<typeof PopperContent>
interface PopoverContentImplProps
  extends PopperContentProps,
    Omit<DismissableLayerProps, 'onDismiss'> {}

const PopoverContentImpl = React.forwardRef<PopoverContentImplElement, PopoverContentImplProps>(
  (props: PopoverContentImplProps, forwardedRef) => {
    const {
      disableOutsidePointerEvents,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      ...contentProps
    } = props
    const context = usePopoverContext()

    const ref = React.useRef<PopoverContentImplElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, ref)
    React.useEffect(() => {
      if (ref.current) {
        const handlePointerUp = () => {
          context.isPointerDownOnContentRef.current = false

          // Delay a frame to ensure we always access the latest selection
          setTimeout(() => {
            const hasSelection = document.getSelection()?.toString() !== ''
            if (hasSelection) context.hasSelectionRef.current = true
          })
        }

        document.addEventListener('pointerup', handlePointerUp)
        return () => {
          document.removeEventListener('pointerup', handlePointerUp)
          context.hasSelectionRef.current = false
          context.isPointerDownOnContentRef.current = false
        }
      }
    }, [context.isPointerDownOnContentRef, context.hasSelectionRef])

    return (
      <DismissableLayer
        disableOutsidePointerEvents={disableOutsidePointerEvents}
        onInteractOutside={onInteractOutside}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={onPointerDownOutside}
        onFocusOutside={composeEventHandlers(onFocusOutside, event => {
          event.preventDefault()
        })}
        onDismiss={context.onDismiss}
      >
        <PopperContent
          data-state={getState(context.open)}
          role="dialog"
          id={context.contentId}
          {...contentProps}
          onPointerDown={composeEventHandlers(contentProps.onPointerDown, event => {
            context.hasSelectionRef.current = false
            context.isPointerDownOnContentRef.current = true
          })}
          ref={composedRefs}
          style={{
            ...contentProps.style,
          }}
        />
      </DismissableLayer>
    )
  },
)

PopoverContentImpl.displayName = 'PopoverContentImpl'

/* -------------------------------------------------------------------------------------------------
 * PopoverClose
 * -----------------------------------------------------------------------------------------------*/

const CLOSE_NAME = 'PopoverClose'

type PopoverCloseElement = React.ElementRef<'button'>
interface PopoverCloseProps extends PrimitiveButtonProps {}

const PopoverClose = React.forwardRef<PopoverCloseElement, PopoverCloseProps>(
  (props: PopoverCloseProps, forwardedRef) => {
    const { ...closeProps } = props
    const context = usePopoverContext()
    return (
      <button
        type="button"
        {...closeProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(props.onClick, () => context.onOpenChange(false))}
      />
    )
  },
)

PopoverClose.displayName = CLOSE_NAME

/* -------------------------------------------------------------------------------------------------
 * PopoverArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'PopoverArrow'

type PopoverArrowElement = React.ElementRef<typeof PopperArrow>
type PopperArrowProps = React.ComponentPropsWithoutRef<typeof PopperArrow>
interface PopoverArrowProps extends PopperArrowProps {}

const PopoverArrow = React.forwardRef<PopoverArrowElement, PopoverArrowProps>(
  (props: PopoverArrowProps, forwardedRef) => {
    return <PopperArrow {...props} ref={forwardedRef} />
  },
)

PopoverArrow.displayName = ARROW_NAME

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
