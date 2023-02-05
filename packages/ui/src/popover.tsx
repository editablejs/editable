import * as React from 'react'
import { Popper, PopperAnchor, PopperArrow, PopperContent } from './popper'
import { useId } from './hooks/use-id'
import { useComposedRefs } from './compose-refs'
import { composeEventHandlers, useIsomorphicLayoutEffect } from './utils'
import { Portal } from './portal'
import { Presence } from './presence'
import { DismissableLayer } from './dismissable-layer'
import { Root } from './root'
import { PointerOpenOptions, usePointerOpen } from './hooks/use-pointer-open'

/* -------------------------------------------------------------------------------------------------
 * Popover
 * -----------------------------------------------------------------------------------------------*/

const POPOVER_NAME = 'Popover'

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
  addChildOpen?(content: React.MutableRefObject<boolean>): void
}

const PopoverContenxt = React.createContext<PopoverContextValue>(null as any)
const usePopoverContext = () => React.useContext(PopoverContenxt)
interface PopoverProps extends Omit<PointerOpenOptions, 'triggerEl' | 'contentEl'> {
  children?: React.ReactNode
}

const Popover: React.FC<PopoverProps> = (props: PopoverProps) => {
  const { children, open: openProp, ...options } = props
  const [trigger, setTrigger] = React.useState<HTMLButtonElement | null>(null)
  const [content, setContent] = React.useState<HTMLDivElement | null>(null)
  const openRef = React.useRef<boolean>(openProp ?? false)
  const [hasCustomAnchor, setHasCustomAnchor] = React.useState(false)
  const childOpens = React.useRef<React.MutableRefObject<boolean>[]>([])
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
    getChildOpens: React.useCallback(() => {
      return childOpens.current.map(c => c.current)
    }, []),
  })

  return (
    <Popper>
      <PopoverContenxt.Provider
        value={{
          contentId: useId(),
          trigger,
          onTriggerChange: setTrigger,
          onContentChange: setContent,
          open,
          onOpenChange: setOpen,
          hasCustomAnchor,
          onCustomAnchorAdd: React.useCallback(() => setHasCustomAnchor(true), []),
          onCustomAnchorRemove: React.useCallback(() => setHasCustomAnchor(false), []),
          onDismiss: React.useCallback(() => setOpen(false), [setOpen]),
          addChildOpen: React.useCallback((open: React.MutableRefObject<boolean>) => {
            if (!childOpens.current.find(c => c === open)) childOpens.current.push(open)
          }, []),
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

type PopoverTriggerElement = React.ElementRef<typeof Root.button>
type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Root.button>
interface PopoverTriggerProps extends PrimitiveButtonProps {
  asChild?: boolean
}

const PopoverTrigger = React.forwardRef<PopoverTriggerElement, PopoverTriggerProps>(
  (props: PopoverTriggerProps, forwardedRef) => {
    const { ...triggerProps } = props
    const context = usePopoverContext()
    const composedTriggerRef = useComposedRefs(forwardedRef, context.onTriggerChange)

    const trigger = (
      <Root.button
        type={context.hasCustomAnchor ? 'button' : undefined}
        aria-haspopup="dialog"
        aria-expanded={context.open}
        aria-controls={context.contentId}
        data-state={getState(context.open)}
        {...triggerProps}
        ref={composedTriggerRef}
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
        <PopoverContentNonModal {...contentProps} ref={forwardedRef} />
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
          const targetIsTrigger = context.trigger?.contains(target)
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

    const composedRefs = useComposedRefs(forwardedRef, context.onContentChange)

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
          tw="z-50"
          {...contentProps}
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

type PopoverCloseElement = React.ElementRef<typeof Root.button>
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
