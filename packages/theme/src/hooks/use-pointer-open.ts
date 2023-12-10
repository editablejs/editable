import { useRef, useCallback, useState, useEffect } from 'rezon'
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'
import { useControllableState } from './use-controllable-state'
import { usePointerInTransit } from './use-pointer-in-transit'

type TriggerAction = 'click' | 'hover' | 'focus'

export interface PointerOpenOptions {
  triggerEl: HTMLElement | null
  contentEl: HTMLElement | null
  trigger?: TriggerAction[] | TriggerAction
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * The duration from when the pointer enters the triggerEl until the tooltip gets opened. This will
   * override the prop with the same name passed to Provider.
   * @defaultValue 300
   */
  delayDuration?: number
  /**
   * How much time a user has to enter another triggerEl without incurring a delay again.
   * @defaultValue 300
   */
  skipDelayDuration?: number
  /**
   * When `true`, trying to hover the contentEl will result in the tooltip closing as the pointer leaves the triggerEl.
   * @defaultValue false
   */
  disableHoverableContent?: boolean
  dispatchDiscreteCustomEvent?: string

  getChildOpens?: () => boolean[]
}

export const usePointerOpen = ({
  triggerEl,
  contentEl,
  trigger,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disableHoverableContent = false,
  skipDelayDuration,
  delayDuration: delayDurationProp,
  dispatchDiscreteCustomEvent,
  getChildOpens,
}: PointerOpenOptions): [boolean, (open: boolean) => void] => {
  const isPointerDownRef = useRef(false)
  const hasPointerMoveOpenedRef = useRef(false)
  const handlePointerUp = useCallback(() => (isPointerDownRef.current = false), [])
  const [isOpenDelayed, setIsOpenDelayed] = useState(true)
  const skipDelayTimerRef = useRef(0)
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: open => {
      if (open) {
        window.clearTimeout(skipDelayTimerRef.current)
        setIsOpenDelayed(false)

        // as `onChange` is called within a lifecycle method we
        // avoid dispatching via `dispatchDiscreteCustomEvent`.
        if (dispatchDiscreteCustomEvent)
          document.dispatchEvent(new CustomEvent(dispatchDiscreteCustomEvent))
      } else {
        window.clearTimeout(skipDelayTimerRef.current)
        skipDelayTimerRef.current = window.setTimeout(
          () => setIsOpenDelayed(true),
          skipDelayDuration,
        )
      }
      onOpenChange?.(open)
    },
  })
  const openTimerRef = useRef(0)
  const delayDuration = delayDurationProp ?? 300
  const wasOpenDelayedRef = useRef(false)
  const handleOpen = useCallback(() => {
    window.clearTimeout(openTimerRef.current)
    wasOpenDelayedRef.current = false
    setOpen(true)
  }, [setOpen])

  const handleClose = useCallback(() => {
    window.clearTimeout(openTimerRef.current)
    setOpen(false)
  }, [setOpen])

  const handleDelayedOpen = useCallback(() => {
    window.clearTimeout(openTimerRef.current)
    openTimerRef.current = window.setTimeout(() => {
      wasOpenDelayedRef.current = true
      setOpen(true)
    }, delayDuration)
  }, [delayDuration, setOpen])

  const handleTriggerEnter = useCallback(() => {
    if (isOpenDelayed) handleDelayedOpen()
    else handleOpen()
  }, [isOpenDelayed, handleDelayedOpen, handleOpen])

  const handleTriggerLeave = useCallback(() => {
    if (disableHoverableContent) {
      handleClose()
    } else {
      // Clear the timer in case the pointer leaves the triggerEl before the tooltip is opened.
      window.clearTimeout(openTimerRef.current)
    }
  }, [handleClose, disableHoverableContent])

  useEffect(() => {
    if (dispatchDiscreteCustomEvent) {
      document.addEventListener(dispatchDiscreteCustomEvent, handleClose)
    }
    return () => {
      window.clearTimeout(openTimerRef.current)
      if (dispatchDiscreteCustomEvent)
        document.removeEventListener(dispatchDiscreteCustomEvent, handleClose)
    }
  }, [dispatchDiscreteCustomEvent, handleClose])

  const isActionClick = !trigger || trigger.includes('click')
  const isActionHover = !trigger || trigger.includes('hover')
  const isActionFocus = !trigger || trigger.includes('focus')

  const isPointerInTransitRef = usePointerInTransit({
    triggerEl,
    contentEl,
    onClose: isActionHover ? handleClose : undefined,
    getChildOpens,
  })

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (event.pointerType === 'touch' || disableHoverableContent) return
      if (!hasPointerMoveOpenedRef.current && !isPointerInTransitRef.current) {
        handleTriggerEnter()
        hasPointerMoveOpenedRef.current = true
      }
    },
    [disableHoverableContent, handleTriggerEnter, isPointerInTransitRef],
  )

  const handlePointerLeave = useCallback(() => {
    handleTriggerLeave()
    hasPointerMoveOpenedRef.current = false
  }, [handleTriggerLeave])

  const handlePointerDown = useCallback(() => {
    isPointerDownRef.current = true
    document.addEventListener('pointerup', handlePointerUp, { once: true })
  }, [handlePointerUp])

  const handleFocus = useCallback(() => {
    if (!isPointerDownRef.current) handleOpen()
  }, [handleOpen])

  const handleBlur = useCallback(() => {
    handleClose()
  }, [handleClose])

  const handleClick = useCallback(() => {
    setOpen(prevOpen => !prevOpen)
  }, [setOpen])

  useIsomorphicLayoutEffect(() => {
    if (!triggerEl) return
    if (isActionHover) {
      triggerEl.addEventListener('pointermove', handlePointerMove, { passive: false })
      triggerEl.addEventListener('pointerleave', handlePointerLeave, { passive: false })
    }
    if (isActionFocus) {
      triggerEl.addEventListener('pointerdown', handlePointerDown, { passive: false })
      triggerEl.addEventListener('focus', handleFocus, { passive: false })
      triggerEl.addEventListener('blur', handleBlur, { passive: false })
    }
    if (isActionClick) {
      triggerEl.addEventListener('click', handleClick, { passive: false })
    }

    return () => {
      triggerEl.removeEventListener('pointermove', handlePointerMove)
      triggerEl.removeEventListener('pointerleave', handlePointerLeave)
      triggerEl.removeEventListener('pointerdown', handlePointerDown)
      triggerEl.removeEventListener('focus', handleFocus)
      triggerEl.removeEventListener('blur', handleBlur)
      triggerEl.removeEventListener('click', handleClick)
    }
  }, [
    isActionHover,
    isActionFocus,
    isActionClick,
    triggerEl,
    handlePointerDown,
    handlePointerMove,
    handlePointerLeave,
    handleFocus,
    handleBlur,
    handleClick,
  ])

  return [open, setOpen]
}
