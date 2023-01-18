import * as React from 'react'
import { Popper, PopperAnchor, PopperArrow, PopperContent } from './popper'
import { createCollection } from './collection'
import { useCallbackRef } from './hooks/use-callback-ref'
import { Presence } from './presence'
import { DismissableLayer } from './dismissable-layer'
import { composeRefs, useComposedRefs } from './compose-refs'
import { composeEventHandlers, dispatchDiscreteCustomEvent } from './utils'
import { useDirection } from './direction'
import { useId } from './hooks/use-id'
import { Root } from './root'

type Direction = 'ltr' | 'rtl'

const SELECTION_KEYS = ['Enter', ' ']
const FIRST_KEYS = ['ArrowDown', 'PageUp', 'Home']
const LAST_KEYS = ['ArrowUp', 'PageDown', 'End']
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS]
const SUB_OPEN_KEYS: Record<Direction, string[]> = {
  ltr: [...SELECTION_KEYS, 'ArrowRight'],
  rtl: [...SELECTION_KEYS, 'ArrowLeft'],
}
const SUB_CLOSE_KEYS: Record<Direction, string[]> = {
  ltr: ['ArrowLeft'],
  rtl: ['ArrowRight'],
}

/* -------------------------------------------------------------------------------------------------
 * Menu
 * -----------------------------------------------------------------------------------------------*/

const MENU_NAME = 'Menu'

type ItemData = { disabled: boolean; textValue: string }
const [Collection, useCollection] = createCollection<MenuItemElement, ItemData>(MENU_NAME)

type MenuContextValue = {
  open: boolean
  onOpenChange(open: boolean): void
  content: MenuContentElement | null
  onContentChange(content: MenuContentElement | null): void
}

const MenuContext = React.createContext<MenuContextValue>({} as any)

const useMenuContext = () => React.useContext(MenuContext)

type MenuRootContextValue = {
  onClose(): void
  isUsingKeyboardRef: React.RefObject<boolean>
  dir: Direction
}

const MenuRootContext = React.createContext<MenuRootContextValue>({} as any)

const useMenuRootContext = () => React.useContext(MenuRootContext)

interface Menu {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?(open: boolean): void
  dir?: Direction
}

const Menu: React.FC<Menu> = props => {
  const { open = false, children, dir, onOpenChange } = props
  const [content, setContent] = React.useState<MenuContentElement | null>(null)
  const isUsingKeyboardRef = React.useRef(false)
  const handleOpenChange = useCallbackRef(onOpenChange)
  const direction = useDirection(dir)

  React.useEffect(() => {
    // Capture phase ensures we set the boolean before any side effects execute
    // in response to the key or pointer event as they might depend on this value.
    const handleKeyDown = () => {
      isUsingKeyboardRef.current = true
      document.addEventListener('pointerdown', handlePointer, { capture: true, once: true })
      document.addEventListener('pointermove', handlePointer, { capture: true, once: true })
    }
    const handlePointer = () => (isUsingKeyboardRef.current = false)
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
      document.removeEventListener('pointerdown', handlePointer, { capture: true })
      document.removeEventListener('pointermove', handlePointer, { capture: true })
    }
  }, [])

  return (
    <Popper>
      <MenuContext.Provider
        value={{
          open,
          onOpenChange: handleOpenChange,
          content,
          onContentChange: setContent,
        }}
      >
        <MenuRootContext.Provider
          value={{
            onClose: React.useCallback(() => handleOpenChange(false), [handleOpenChange]),
            isUsingKeyboardRef: isUsingKeyboardRef,
            dir: direction,
          }}
        >
          {children}
        </MenuRootContext.Provider>
      </MenuContext.Provider>
    </Popper>
  )
}

Menu.displayName = MENU_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuAnchor
 * -----------------------------------------------------------------------------------------------*/

const ANCHOR_NAME = 'MenuAnchor'

type MenuAnchorElement = React.ElementRef<typeof PopperAnchor>
type PopperAnchorProps = React.ComponentPropsWithoutRef<typeof PopperAnchor>
interface MenuAnchor extends PopperAnchorProps {}

const MenuAnchor = React.forwardRef<MenuAnchorElement, MenuAnchor>((props, forwardedRef) => {
  return <PopperAnchor {...props} ref={forwardedRef} />
})

MenuAnchor.displayName = ANCHOR_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'MenuContent'

type MenuContentContextValue = {
  onItemEnter(event: React.PointerEvent): void
  onItemLeave(event: React.PointerEvent): void
  onTriggerLeave(event: React.PointerEvent): void
  searchRef: React.RefObject<string>
  pointerGraceTimerRef: React.MutableRefObject<number>
  onPointerGraceIntentChange(intent: GraceIntent | null): void
}

const MenuContentContext = React.createContext<MenuContentContextValue>({} as any)

const useMenuContentContext = () => React.useContext(MenuContentContext)

type MenuContentElement = MenuRootContentTypeElement
/**
 * We purposefully don't union MenuRootContent and MenuSubContent props here because
 * they have conflicting prop types. We agreed that we would allow MenuSubContent to
 * accept props that it would just ignore.
 */
interface MenuContentProps extends MenuRootContentTypeProps {}

const MenuContent = React.forwardRef<MenuContentElement, MenuContentProps>(
  (props, forwardedRef) => {
    const context = useMenuContext()

    return (
      <Collection.Provider>
        <Presence present={context.open}>
          <Collection.Slot>
            <MenuRootContent {...props} ref={forwardedRef} />
          </Collection.Slot>
        </Presence>
      </Collection.Provider>
    )
  },
)

/* ---------------------------------------------------------------------------------------------- */

type MenuRootContentTypeElement = MenuContentImplElement
interface MenuRootContentTypeProps
  extends Omit<MenuContentImplProps, keyof MenuContentImplPrivateProps> {}

const MenuRootContent = React.forwardRef<MenuRootContentTypeElement, MenuRootContentTypeProps>(
  (props, forwardedRef) => {
    const context = useMenuContext()
    return (
      <MenuContentImpl
        {...props}
        ref={forwardedRef}
        disableOutsidePointerEvents={false}
        onDismiss={() => context.onOpenChange(false)}
      />
    )
  },
)

MenuRootContent.displayName = 'MenuRootContent'

/* ---------------------------------------------------------------------------------------------- */

type MenuContentImplElement = React.ElementRef<typeof PopperContent>
type DismissableLayerProps = React.ComponentPropsWithoutRef<typeof DismissableLayer>
type PopperContentProps = React.ComponentPropsWithoutRef<typeof PopperContent>
type MenuContentImplPrivateProps = {
  onDismiss?: DismissableLayerProps['onDismiss']
  disableOutsidePointerEvents?: DismissableLayerProps['disableOutsidePointerEvents']
}
interface MenuContentImplProps
  extends MenuContentImplPrivateProps,
    Omit<PopperContentProps, 'dir'> {
  onEscapeKeyDown?: DismissableLayerProps['onEscapeKeyDown']
  onPointerDownOutside?: DismissableLayerProps['onPointerDownOutside']
  onFocusOutside?: DismissableLayerProps['onFocusOutside']
  onInteractOutside?: DismissableLayerProps['onInteractOutside']
}

const MenuContentImpl = React.forwardRef<MenuContentImplElement, MenuContentImplProps>(
  (props, forwardedRef) => {
    const {
      disableOutsidePointerEvents,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      ...contentProps
    } = props
    const context = useMenuContext()
    const rootContext = useMenuRootContext()
    const getItems = useCollection()
    const contentRef = React.useRef<HTMLDivElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, contentRef, context.onContentChange)
    const timerRef = React.useRef(0)
    const searchRef = React.useRef('')
    const pointerGraceTimerRef = React.useRef(0)
    const pointerGraceIntentRef = React.useRef<GraceIntent | null>(null)
    const pointerDirRef = React.useRef<Side>('right')
    const lastPointerXRef = React.useRef(0)

    const handleTypeaheadSearch = (key: string) => {
      const search = searchRef.current + key

      // Reset `searchRef` 1 second after it was last updated
      ;(function updateSearch(value: string) {
        searchRef.current = value
        window.clearTimeout(timerRef.current)
        if (value !== '') timerRef.current = window.setTimeout(() => updateSearch(''), 1000)
      })(search)
    }

    React.useEffect(() => {
      return () => window.clearTimeout(timerRef.current)
    }, [])

    const isPointerMovingToSubmenu = React.useCallback((event: React.PointerEvent) => {
      const isMovingTowards = pointerDirRef.current === pointerGraceIntentRef.current?.side
      return isMovingTowards && isPointerInGraceArea(event, pointerGraceIntentRef.current?.area)
    }, [])

    return (
      <MenuContentContext.Provider
        value={{
          searchRef,
          onItemEnter: React.useCallback(
            event => {
              if (isPointerMovingToSubmenu(event)) event.preventDefault()
            },
            [isPointerMovingToSubmenu],
          ),
          onItemLeave: React.useCallback(
            event => {
              if (isPointerMovingToSubmenu(event)) return
            },
            [isPointerMovingToSubmenu],
          ),
          onTriggerLeave: React.useCallback(
            event => {
              if (isPointerMovingToSubmenu(event)) event.preventDefault()
            },
            [isPointerMovingToSubmenu],
          ),
          pointerGraceTimerRef,
          onPointerGraceIntentChange: React.useCallback(intent => {
            pointerGraceIntentRef.current = intent
          }, []),
        }}
      >
        <DismissableLayer
          disableOutsidePointerEvents={disableOutsidePointerEvents}
          onEscapeKeyDown={onEscapeKeyDown}
          onPointerDownOutside={onPointerDownOutside}
          onFocusOutside={onFocusOutside}
          onInteractOutside={onInteractOutside}
          onDismiss={onDismiss}
        >
          <PopperContent
            role="menu"
            aria-orientation="vertical"
            data-state={getOpenState(context.open)}
            dir={rootContext.dir}
            {...contentProps}
            ref={composedRefs}
            style={{ outline: 'none', ...contentProps.style }}
            onKeyDown={composeEventHandlers(contentProps.onKeyDown, event => {
              // submenu key events bubble through portals. We only care about keys in this menu.
              const target = event.target as HTMLElement
              const isKeyDownInside = target.closest('[role="menu"]') === event.currentTarget
              const isModifierKey = event.ctrlKey || event.altKey || event.metaKey
              const isCharacterKey = event.key.length === 1
              if (isKeyDownInside) {
                // menus should not be navigated using tab key so we prevent it
                if (event.key === 'Tab') event.preventDefault()
                if (!isModifierKey && isCharacterKey) handleTypeaheadSearch(event.key)
              }
              // focus first/last item based on key pressed
              const content = contentRef.current
              if (event.target !== content) return
              if (!FIRST_LAST_KEYS.includes(event.key)) return
              event.preventDefault()
              const items = getItems().filter(item => !item.disabled)
              const candidateNodes = items.map(item => item.ref.current!)
              if (LAST_KEYS.includes(event.key)) candidateNodes.reverse()
            })}
            onBlur={composeEventHandlers(props.onBlur, event => {
              // clear search buffer when leaving the menu
              if (!event.currentTarget.contains(event.target)) {
                window.clearTimeout(timerRef.current)
                searchRef.current = ''
              }
            })}
            onPointerMove={composeEventHandlers(
              props.onPointerMove,
              whenMouse(event => {
                const target = event.target as HTMLElement
                const pointerXHasChanged = lastPointerXRef.current !== event.clientX

                // We don't use `event.movementX` for this check because Safari will
                // always return `0` on a pointer event.
                if (event.currentTarget.contains(target) && pointerXHasChanged) {
                  const newDir = event.clientX > lastPointerXRef.current ? 'right' : 'left'
                  pointerDirRef.current = newDir
                  lastPointerXRef.current = event.clientX
                }
              }),
            )}
          />
        </DismissableLayer>
      </MenuContentContext.Provider>
    )
  },
)

MenuContentImpl.displayName = 'MenuContentImpl'

MenuContent.displayName = CONTENT_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuGroup
 * -----------------------------------------------------------------------------------------------*/

const GROUP_NAME = 'MenuGroup'

type MenuGroupElement = React.ElementRef<typeof Root.div>
type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Root.div>
interface MenuGroupProps extends PrimitiveDivProps {
  children?: React.ReactNode
}

const MenuGroup = React.forwardRef<MenuGroupElement, MenuGroupProps>((props, forwardedRef) => {
  return <Root.div role="group" {...props} ref={forwardedRef} />
})

MenuGroup.displayName = GROUP_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuLabel
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = 'MenuLabel'

type MenuLabelElement = React.ElementRef<typeof Root.div>
interface MenuLabel extends PrimitiveDivProps {}

const MenuLabel = React.forwardRef<MenuLabelElement, MenuLabel>((props, forwardedRef) => {
  return <Root.div {...props} ref={forwardedRef} />
})

MenuLabel.displayName = LABEL_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'MenuItem'
const ITEM_SELECT = 'menu.itemSelect'

type MenuItemElement = MenuItemImplElement
interface MenuItem extends Omit<MenuItemImplProps, 'onSelect'> {
  onSelect?: (event: Event) => void
}

const MenuItem = React.forwardRef<MenuItemElement, MenuItem>((props, forwardedRef) => {
  const { disabled = false, onSelect, ...itemProps } = props
  const ref = React.useRef<HTMLDivElement>(null)
  const rootContext = useMenuRootContext()
  const contentContext = useMenuContentContext()
  const composedRefs = useComposedRefs(forwardedRef, ref)
  const isPointerDownRef = React.useRef(false)

  const handleSelect = () => {
    const menuItem = ref.current
    if (!disabled && menuItem) {
      const itemSelectEvent = new CustomEvent(ITEM_SELECT, { bubbles: true, cancelable: true })
      menuItem.addEventListener(ITEM_SELECT, event => onSelect?.(event), { once: true })
      dispatchDiscreteCustomEvent(menuItem, itemSelectEvent)
      if (itemSelectEvent.defaultPrevented) {
        isPointerDownRef.current = false
      } else {
        rootContext.onClose()
      }
    }
  }

  return (
    <MenuItemImpl
      {...itemProps}
      ref={composedRefs}
      disabled={disabled}
      onClick={composeEventHandlers(props.onClick, handleSelect)}
      onPointerDown={event => {
        props.onPointerDown?.(event)
        isPointerDownRef.current = true
      }}
      onPointerUp={composeEventHandlers(props.onPointerUp, event => {
        // Pointer down can move to a different menu item which should activate it on pointer up.
        // We dispatch a click for selection to allow composition with click based triggers and to
        // prevent Firefox from getting stuck in text selection mode when the menu closes.
        if (!isPointerDownRef.current) event.currentTarget?.click()
      })}
      onKeyDown={composeEventHandlers(props.onKeyDown, event => {
        const isTypingAhead = contentContext.searchRef.current !== ''
        if (disabled || (isTypingAhead && event.key === ' ')) return
        if (SELECTION_KEYS.includes(event.key)) {
          event.currentTarget.click()
          /**
           * We prevent default browser behaviour for selection keys as they should trigger
           * a selection only:
           * - prevents space from scrolling the page.
           * - if keydown causes focus to move, prevents keydown from firing on the new target.
           */
          event.preventDefault()
        }
      })}
    />
  )
})

MenuItem.displayName = ITEM_NAME

/* ---------------------------------------------------------------------------------------------- */

type MenuItemImplElement = React.ElementRef<typeof Root.div>
interface MenuItemImplProps extends PrimitiveDivProps {
  disabled?: boolean
  textValue?: string
  children?: React.ReactNode
}

const MenuItemImpl = React.forwardRef<MenuItemImplElement, MenuItemImplProps>(
  (props, forwardedRef) => {
    const { disabled = false, textValue, ...itemProps } = props
    const contentContext = useMenuContentContext()
    const ref = React.useRef<HTMLDivElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, ref)
    const [isFocused, setIsFocused] = React.useState(false)

    // get the item's `.textContent` as default strategy for typeahead `textValue`
    const [textContent, setTextContent] = React.useState('')
    React.useEffect(() => {
      const menuItem = ref.current
      if (menuItem) {
        setTextContent((menuItem.textContent ?? '').trim())
      }
    }, [itemProps.children])

    return (
      <Collection.ItemSlot disabled={disabled} textValue={textValue ?? textContent}>
        <Root.div
          role="menuitem"
          data-highlighted={isFocused ? '' : undefined}
          aria-disabled={disabled || undefined}
          data-disabled={disabled ? '' : undefined}
          {...itemProps}
          ref={composedRefs}
          /**
           * We focus items on `pointerMove` to achieve the following:
           *
           * - Mouse over an item (it focuses)
           * - Leave mouse where it is and use keyboard to focus a different item
           * - Wiggle mouse without it leaving previously focused item
           * - Previously focused item should re-focus
           *
           * If we used `mouseOver`/`mouseEnter` it would not re-focus when the mouse
           * wiggles. This is to match native menu implementation.
           */
          onPointerMove={composeEventHandlers(
            props.onPointerMove,
            whenMouse(event => {
              if (disabled) {
                contentContext.onItemLeave(event)
              } else {
                contentContext.onItemEnter(event)
              }
            }),
          )}
          onPointerLeave={composeEventHandlers(
            props.onPointerLeave,
            whenMouse(event => contentContext.onItemLeave(event)),
          )}
          onFocus={composeEventHandlers(props.onFocus, () => setIsFocused(true))}
          onBlur={composeEventHandlers(props.onBlur, () => setIsFocused(false))}
        />
      </Collection.ItemSlot>
    )
  },
)

MenuItemImpl.displayName = 'MenuItemImpl'

/* -------------------------------------------------------------------------------------------------
 * MenuRadioGroup
 * -----------------------------------------------------------------------------------------------*/

const RADIO_GROUP_NAME = 'MenuRadioGroup'

const RadioGroupContext = React.createContext<MenuRadioGroup>({
  value: undefined,
  onValueChange: () => {},
})

const useRadioGroupContext = () => React.useContext(RadioGroupContext)

type MenuRadioGroupElement = React.ElementRef<typeof MenuGroup>
interface MenuRadioGroup extends MenuGroupProps {
  value?: string
  onValueChange?: (value: string) => void
}

const MenuRadioGroup = React.forwardRef<MenuRadioGroupElement, MenuRadioGroup>(
  (props, forwardedRef) => {
    const { value, onValueChange, ...groupProps } = props
    const handleValueChange = useCallbackRef(onValueChange)
    return (
      <RadioGroupContext.Provider
        value={{
          value,
          onValueChange: handleValueChange,
        }}
      >
        <MenuGroup {...groupProps} ref={forwardedRef} />
      </RadioGroupContext.Provider>
    )
  },
)

MenuRadioGroup.displayName = RADIO_GROUP_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuRadioItem
 * -----------------------------------------------------------------------------------------------*/

const RADIO_ITEM_NAME = 'MenuRadioItem'

type MenuRadioItemElement = React.ElementRef<typeof MenuItem>
interface MenuRadioItem extends MenuItem {
  value: string
}

const MenuRadioItem = React.forwardRef<MenuRadioItemElement, MenuRadioItem>(
  (props, forwardedRef) => {
    const { value, ...radioItemProps } = props
    const context = useRadioGroupContext()
    const checked = value === context.value
    return (
      <ItemIndicatorContext.Provider value={{ checked }}>
        <MenuItem
          role="menuitemradio"
          aria-checked={checked}
          {...radioItemProps}
          ref={forwardedRef}
          data-state={getCheckedState(checked)}
          onSelect={composeEventHandlers(
            radioItemProps.onSelect,
            () => context.onValueChange?.(value),
            { checkForDefaultPrevented: false },
          )}
        />
      </ItemIndicatorContext.Provider>
    )
  },
)

MenuRadioItem.displayName = RADIO_ITEM_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuItemIndicator
 * -----------------------------------------------------------------------------------------------*/

const ITEM_INDICATOR_NAME = 'MenuItemIndicator'

const ItemIndicatorContext = React.createContext({
  checked: false,
})

const useItemIndicatorContext = () => React.useContext(ItemIndicatorContext)

type MenuItemIndicatorElement = React.ElementRef<typeof Root.span>
type PrimitiveSpanProps = React.ComponentPropsWithoutRef<typeof Root.span>
interface MenuItemIndicator extends PrimitiveSpanProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true
}

const MenuItemIndicator = React.forwardRef<MenuItemIndicatorElement, MenuItemIndicator>(
  (props, forwardedRef) => {
    const { forceMount, ...itemIndicatorProps } = props
    const indicatorContext = useItemIndicatorContext()
    return (
      <Presence present={forceMount || indicatorContext.checked}>
        <Root.span
          {...itemIndicatorProps}
          ref={forwardedRef}
          data-state={getCheckedState(indicatorContext.checked)}
        />
      </Presence>
    )
  },
)

MenuItemIndicator.displayName = ITEM_INDICATOR_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuSeparator
 * -----------------------------------------------------------------------------------------------*/

const SEPARATOR_NAME = 'MenuSeparator'

type MenuSeparatorElement = React.ElementRef<typeof Root.div>
interface MenuSeparator extends PrimitiveDivProps {}

const MenuSeparator = React.forwardRef<MenuSeparatorElement, MenuSeparator>(
  (props, forwardedRef) => {
    return <Root.div role="separator" aria-orientation="horizontal" {...props} ref={forwardedRef} />
  },
)

MenuSeparator.displayName = SEPARATOR_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'MenuArrow'

type MenuArrowElement = React.ElementRef<typeof PopperArrow>
type PopperArrowProps = React.ComponentPropsWithoutRef<typeof PopperArrow>
interface MenuArrow extends PopperArrowProps {}

const MenuArrow = React.forwardRef<MenuArrowElement, MenuArrow>(
  (props: MenuArrow, forwardedRef) => {
    return <PopperArrow {...props} ref={forwardedRef} />
  },
)

MenuArrow.displayName = ARROW_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuSub
 * -----------------------------------------------------------------------------------------------*/

const SUB_NAME = 'MenuSub'

type MenuSubContextValue = {
  contentId: string
  triggerId: string
  trigger: MenuSubTriggerElement | null
  onTriggerChange(trigger: MenuSubTriggerElement | null): void
}

const MenuSubContext = React.createContext<MenuSubContextValue>({} as any)

const useMenuSubContext = () => React.useContext(MenuSubContext)

interface MenuSub {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?(open: boolean): void
}

const MenuSub: React.FC<MenuSub> = props => {
  const { children, open = false, onOpenChange } = props
  const parentMenuContext = useMenuContext()
  const [trigger, setTrigger] = React.useState<MenuSubTriggerElement | null>(null)
  const [content, setContent] = React.useState<MenuContentElement | null>(null)
  const handleOpenChange = useCallbackRef(onOpenChange)

  // Prevent the parent menu from reopening with open submenus.
  React.useEffect(() => {
    if (parentMenuContext.open === false) handleOpenChange(false)
    return () => handleOpenChange(false)
  }, [parentMenuContext.open, handleOpenChange])

  return (
    <Popper>
      <MenuContext.Provider
        value={{
          open,
          onOpenChange: handleOpenChange,
          content,
          onContentChange: setContent,
        }}
      >
        <MenuSubContext.Provider
          value={{
            contentId: useId(),
            triggerId: useId(),
            trigger,
            onTriggerChange: setTrigger,
          }}
        >
          {children}
        </MenuSubContext.Provider>
      </MenuContext.Provider>
    </Popper>
  )
}

MenuSub.displayName = SUB_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuSubTrigger
 * -----------------------------------------------------------------------------------------------*/

const SUB_TRIGGER_NAME = 'MenuSubTrigger'

type MenuSubTriggerElement = MenuItemImplElement
interface MenuSubTrigger extends MenuItemImplProps {}

const MenuSubTrigger = React.forwardRef<MenuSubTriggerElement, MenuSubTrigger>(
  (props, forwardedRef) => {
    const context = useMenuContext()
    const rootContext = useMenuRootContext()
    const subContext = useMenuSubContext()
    const contentContext = useMenuContentContext()
    const openTimerRef = React.useRef<number | null>(null)
    const { pointerGraceTimerRef, onPointerGraceIntentChange } = contentContext

    const clearOpenTimer = React.useCallback(() => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }, [])

    React.useEffect(() => clearOpenTimer, [clearOpenTimer])

    React.useEffect(() => {
      const pointerGraceTimer = pointerGraceTimerRef.current
      return () => {
        window.clearTimeout(pointerGraceTimer)
        onPointerGraceIntentChange(null)
      }
    }, [pointerGraceTimerRef, onPointerGraceIntentChange])

    return (
      <MenuAnchor>
        <MenuItemImpl
          id={subContext.triggerId}
          aria-haspopup="menu"
          aria-expanded={context.open}
          aria-controls={subContext.contentId}
          data-state={getOpenState(context.open)}
          {...props}
          ref={composeRefs(forwardedRef, subContext.onTriggerChange)}
          // This is redundant for mouse users but we cannot determine pointer type from
          // click event and we cannot use pointerup event (see git history for reasons why)
          onClick={event => {
            props.onClick?.(event)
            if (props.disabled || event.defaultPrevented) return
            if (!context.open) context.onOpenChange(true)
          }}
          onPointerMove={composeEventHandlers(
            props.onPointerMove,
            whenMouse(event => {
              contentContext.onItemEnter(event)
              if (event.defaultPrevented) return
              if (!props.disabled && !context.open && !openTimerRef.current) {
                contentContext.onPointerGraceIntentChange(null)
                openTimerRef.current = window.setTimeout(() => {
                  context.onOpenChange(true)
                  clearOpenTimer()
                }, 100)
              }
            }),
          )}
          onPointerLeave={composeEventHandlers(
            props.onPointerLeave,
            whenMouse(event => {
              clearOpenTimer()

              const contentRect = context.content?.getBoundingClientRect()
              if (contentRect) {
                // TODO: make sure to update this when we change positioning logic
                const side = context.content?.dataset.side as Side
                const rightSide = side === 'right'
                const bleed = rightSide ? -5 : +5
                const contentNearEdge = contentRect[rightSide ? 'left' : 'right']
                const contentFarEdge = contentRect[rightSide ? 'right' : 'left']

                contentContext.onPointerGraceIntentChange({
                  area: [
                    // Apply a bleed on clientX to ensure that our exit point is
                    // consistently within polygon bounds
                    { x: event.clientX + bleed, y: event.clientY },
                    { x: contentNearEdge, y: contentRect.top },
                    { x: contentFarEdge, y: contentRect.top },
                    { x: contentFarEdge, y: contentRect.bottom },
                    { x: contentNearEdge, y: contentRect.bottom },
                  ],
                  side,
                })

                window.clearTimeout(pointerGraceTimerRef.current)
                pointerGraceTimerRef.current = window.setTimeout(
                  () => contentContext.onPointerGraceIntentChange(null),
                  300,
                )
              } else {
                contentContext.onTriggerLeave(event)
                if (event.defaultPrevented) return

                // There's 100ms where the user may leave an item before the submenu was opened.
                contentContext.onPointerGraceIntentChange(null)
              }
            }),
          )}
          onKeyDown={composeEventHandlers(props.onKeyDown, event => {
            const isTypingAhead = contentContext.searchRef.current !== ''
            if (props.disabled || (isTypingAhead && event.key === ' ')) return
            if (SUB_OPEN_KEYS[rootContext.dir].includes(event.key)) {
              context.onOpenChange(true)
              // prevent window from scrolling
              event.preventDefault()
            }
          })}
        />
      </MenuAnchor>
    )
  },
)

MenuSubTrigger.displayName = SUB_TRIGGER_NAME

/* -------------------------------------------------------------------------------------------------
 * MenuSubContent
 * -----------------------------------------------------------------------------------------------*/

const SUB_CONTENT_NAME = 'MenuSubContent'

type MenuSubContentElement = MenuContentImplElement
interface MenuSubContent
  extends Omit<
    MenuContentImplProps,
    keyof MenuContentImplPrivateProps | 'onCloseAutoFocus' | 'side' | 'align'
  > {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true
}

const MenuSubContent = React.forwardRef<MenuSubContentElement, MenuSubContent>(
  (props, forwardedRef) => {
    const context = useMenuContext()
    const rootContext = useMenuRootContext()
    const subContext = useMenuSubContext()
    const ref = React.useRef<MenuSubContentElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, ref)
    return (
      <Collection.Provider>
        <Presence present={context.open}>
          <Collection.Slot>
            <MenuContentImpl
              id={subContext.contentId}
              aria-labelledby={subContext.triggerId}
              {...props}
              ref={composedRefs}
              align="start"
              side={rootContext.dir === 'rtl' ? 'left' : 'right'}
              disableOutsidePointerEvents={false}
              onFocusOutside={composeEventHandlers(props.onFocusOutside, event => {
                // We prevent closing when the trigger is focused to avoid triggering a re-open animation
                // on pointer interaction.
                if (event.target !== subContext.trigger) context.onOpenChange(false)
              })}
              onEscapeKeyDown={composeEventHandlers(props.onEscapeKeyDown, rootContext.onClose)}
              onKeyDown={composeEventHandlers(props.onKeyDown, event => {
                // Submenu key events bubble through portals. We only care about keys in this menu.
                const isKeyDownInside = event.currentTarget.contains(event.target as HTMLElement)
                const isCloseKey = SUB_CLOSE_KEYS[rootContext.dir].includes(event.key)
                if (isKeyDownInside && isCloseKey) {
                  context.onOpenChange(false)
                  // prevent window from scrolling
                  event.preventDefault()
                }
              })}
            />
          </Collection.Slot>
        </Presence>
      </Collection.Provider>
    )
  },
)

MenuSubContent.displayName = SUB_CONTENT_NAME

/* -----------------------------------------------------------------------------------------------*/

function getOpenState(open: boolean) {
  return open ? 'open' : 'closed'
}

function getCheckedState(checked: boolean) {
  return checked ? 'checked' : 'unchecked'
}

/**
 * Wraps an array around itself at a given start index
 * Example: `wrapArray(['a', 'b', 'c', 'd'], 2) === ['c', 'd', 'a', 'b']`
 */
function wrapArray<T>(array: T[], startIndex: number) {
  return array.map((_, index) => array[(startIndex + index) % array.length])
}

/**
 * This is the "meat" of the typeahead matching logic. It takes in all the values,
 * the search and the current match, and returns the next match (or `undefined`).
 *
 * We normalize the search because if a user has repeatedly pressed a character,
 * we want the exact same behavior as if we only had that one character
 * (ie. cycle through options starting with that character)
 *
 * We also reorder the values by wrapping the array around the current match.
 * This is so we always look forward from the current match, and picking the first
 * match will always be the correct one.
 *
 * Finally, if the normalized search is exactly one character, we exclude the
 * current match from the values because otherwise it would be the first to match always
 * and focus would never move. This is as opposed to the regular case, where we
 * don't want focus to move if the current match still matches.
 */
function getNextMatch(values: string[], search: string, currentMatch?: string) {
  const isRepeated = search.length > 1 && Array.from(search).every(char => char === search[0])
  const normalizedSearch = isRepeated ? search[0] : search
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1
  let wrappedValues = wrapArray(values, Math.max(currentMatchIndex, 0))
  const excludeCurrentMatch = normalizedSearch.length === 1
  if (excludeCurrentMatch) wrappedValues = wrappedValues.filter(v => v !== currentMatch)
  const nextMatch = wrappedValues.find(value =>
    value.toLowerCase().startsWith(normalizedSearch.toLowerCase()),
  )
  return nextMatch !== currentMatch ? nextMatch : undefined
}

type Point = { x: number; y: number }
type Polygon = Point[]
type Side = 'left' | 'right'
type GraceIntent = { area: Polygon; side: Side }

// Determine if a point is inside of a polygon.
// Based on https://github.com/substack/point-in-polygon
function isPointInPolygon(point: Point, polygon: Polygon) {
  const { x, y } = point
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    // prettier-ignore
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside
  }

  return inside
}

function isPointerInGraceArea(event: React.PointerEvent, area?: Polygon) {
  if (!area) return false
  const cursorPos = { x: event.clientX, y: event.clientY }
  return isPointInPolygon(cursorPos, area)
}

function whenMouse<E>(handler: React.PointerEventHandler<E>): React.PointerEventHandler<E> {
  return event => (event.pointerType === 'mouse' ? handler(event) : undefined)
}

export {
  Menu,
  MenuAnchor,
  MenuContent,
  MenuLabel,
  MenuItem,
  MenuGroup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuItemIndicator,
  MenuSeparator,
  MenuArrow,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
}
