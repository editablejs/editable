import { Popper, PopperAnchor, PopperAnchorProps, PopperArrow, PopperContent, PopperContentProps } from './popper'
import { createCollection } from './collection'
import { useCallbackRef } from '@/hooks/use-callback-ref'
import { Presence } from './presence'
import { DismissableLayer, DismissableLayerProps } from './dismissable-layer'
import { composeRefs, useComposedRefs } from './compose-refs'
import { composeEventHandlers, dispatchDiscreteCustomEvent } from '@/utils'
import { useDirection } from './direction'
import { useId } from '@/hooks/use-id'
import { createContext, useContext, RefObject, useState, useRef, useEffect, useCallback, MutableRefObject, PointerEventHandler, c, HTMLAttributes, html } from 'rezon'
import { ref } from 'rezon/directives/ref'
import { spread } from 'rezon/directives/spread'

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

const MenuContext = createContext<MenuContextValue>({} as any)

const useMenuContext = () => useContext(MenuContext)

type MenuRootContextValue = {
  onClose(): void
  isUsingKeyboardRef: RefObject<boolean>
  dir: Direction
}

const MenuRootContext = createContext<MenuRootContextValue>({} as any)

const useMenuRootContext = () => useContext(MenuRootContext)

export interface MenuProps {
  children?: unknown
  open?: boolean
  onOpenChange?(open: boolean): void
  dir?: Direction
}

const Menu = c<MenuProps>(props => {
  const { open = false, children, dir, onOpenChange } = props
  const [content, setContent] = useState<MenuContentElement | null>(null)
  const isUsingKeyboardRef = useRef(false)
  const handleOpenChange = useCallbackRef(onOpenChange)
  const direction = useDirection(dir)

  useEffect(() => {
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

  return Popper({
    children: MenuContext.Provider({
      value: {
        open,
        onOpenChange: handleOpenChange,
        content,
        onContentChange: setContent,
      },
      children: MenuRootContext.Provider({
        value: {
          onClose: () => handleOpenChange(false),
          isUsingKeyboardRef,
          dir: direction,
        },
        children,
      }),
    })
  });
})

/* -------------------------------------------------------------------------------------------------
 * MenuAnchor
 * -----------------------------------------------------------------------------------------------*/


interface MenuAnchor extends PopperAnchorProps { }

const MenuAnchor = PopperAnchor

/* -------------------------------------------------------------------------------------------------
 * MenuContent
 * -----------------------------------------------------------------------------------------------*/

type MenuContentContextValue = {
  onItemEnter(event: PointerEvent): void
  onItemLeave(event: PointerEvent): void
  onTriggerLeave(event: PointerEvent): void
  searchRef: RefObject<string>
  pointerGraceTimerRef: MutableRefObject<number>
  onPointerGraceIntentChange(intent: GraceIntent | null): void
}

const MenuContentContext = createContext<MenuContentContextValue>({} as any)

const useMenuContentContext = () => useContext(MenuContentContext)

type MenuContentElement = MenuRootContentTypeElement
/**
 * We purposefully don't union MenuRootContent and MenuSubContent props here because
 * they have conflicting prop types. We agreed that we would allow MenuSubContent to
 * accept props that it would just ignore.
 */
interface MenuContentProps extends MenuRootContentTypeProps { }

const MenuContent = c<MenuContentProps>((props) => {
  const context = useMenuContext()

  return Collection.Provider({
    children: Presence({
      present: context.open,
      children: Collection.Slot({
        children: MenuRootContent(props),
      }),
    }),
  })
})


/* ---------------------------------------------------------------------------------------------- */

type MenuRootContentTypeElement = MenuContentImplElement
interface MenuRootContentTypeProps
  extends Omit<MenuContentImplProps, keyof MenuContentImplPrivateProps> { }

const MenuRootContent = c<MenuRootContentTypeProps>((props) => {
  const context = useMenuContext()
  return MenuContentImpl({
    ...props,
    disableOutsidePointerEvents: false,
    onDismiss: () => context.onOpenChange(false),
  })
})

/* ---------------------------------------------------------------------------------------------- */
type MenuContentImplElement = HTMLDivElement
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

const MenuContentImpl = c<MenuContentImplProps>(
  (props) => {
    const {
      disableOutsidePointerEvents,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      ref: forwardedRef,
      ...contentProps
    } = props
    const context = useMenuContext()
    const rootContext = useMenuRootContext()
    const getItems = useCollection()
    const contentRef = useRef<HTMLDivElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, contentRef, context.onContentChange)
    const timerRef = useRef(0)
    const searchRef = useRef('')
    const pointerGraceTimerRef = useRef(0)
    const pointerGraceIntentRef = useRef<GraceIntent | null>(null)
    const pointerDirRef = useRef<Side>('right')
    const lastPointerXRef = useRef(0)

    const handleTypeaheadSearch = (key: string) => {
      const search = searchRef.current + key

        // Reset `searchRef` 1 second after it was last updated
        ; (function updateSearch(value: string) {
          searchRef.current = value
          window.clearTimeout(timerRef.current)
          if (value !== '') timerRef.current = window.setTimeout(() => updateSearch(''), 1000)
        })(search)
    }

    useEffect(() => {
      return () => window.clearTimeout(timerRef.current)
    }, [])

    const isPointerMovingToSubmenu = useCallback((event: PointerEvent) => {
      const isMovingTowards = pointerDirRef.current === pointerGraceIntentRef.current?.side
      return isMovingTowards && isPointerInGraceArea(event, pointerGraceIntentRef.current?.area)
    }, [])

    return MenuContentContext.Provider({
      value: {
        searchRef,
        onItemEnter: useCallback(
          event => {
            if (isPointerMovingToSubmenu(event)) event.preventDefault()
          },
          [isPointerMovingToSubmenu],
        ),
        onItemLeave: useCallback(
          event => {
            if (isPointerMovingToSubmenu(event)) return
          },
          [isPointerMovingToSubmenu],
        ),
        onTriggerLeave: useCallback(
          event => {
            if (isPointerMovingToSubmenu(event)) event.preventDefault()
          },
          [isPointerMovingToSubmenu],
        ),
        pointerGraceTimerRef,
        onPointerGraceIntentChange: useCallback(intent => {
          pointerGraceIntentRef.current = intent
        }, []),
      },
      children: DismissableLayer({
        disableOutsidePointerEvents,
        onEscapeKeyDown,
        onPointerDownOutside,
        onFocusOutside,
        onInteractOutside,
        onDismiss,
        children: PopperContent({
          role: 'menu',
          'aria-orientation': 'vertical',
          'data-state': getOpenState(context.open),
          dir: rootContext.dir,
          ...contentProps,
          ref: composedRefs,
          style: { outline: 'none', ...contentProps.style },
          onKeyDown: composeEventHandlers(contentProps.onKeyDown, event => {
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
            candidateNodes[0].focus()
          }),
          onBlur: composeEventHandlers(props.onBlur, event => {
            // clear search buffer when leaving the menu
            if (!event.currentTarget.contains(event.target as Node)) {
              window.clearTimeout(timerRef.current)
              searchRef.current = ''
            }
          }),
          onPointerMove: composeEventHandlers(
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
          ),
        }),
      })
    })
  })

type PrimitiveDivProps = HTMLAttributes<HTMLDivElement>
interface MenuGroupProps extends PrimitiveDivProps {
  children?: unknown
}

const MenuGroup = c<MenuGroupProps>((props) => {
  return html`<div role="group" ${spread(props)} ></div>`
})

interface MenuLabel extends PrimitiveDivProps { }

const MenuLabel = c<MenuLabel>((props) => {
  return html`<div role="group" ${spread(props)} ></div>`
})

/* -------------------------------------------------------------------------------------------------
 * MenuItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_SELECT = 'menu.itemSelect'

type MenuItemElement = MenuItemImplElement
interface MenuItem extends Omit<MenuItemImplProps, 'onSelect'> {
  onSelect?: (event: Event) => void
  "data-state"?: string
}

const MenuItem = c<MenuItem>((props) => {
  const { disabled = false, onSelect, ref: forwardedRef, ...itemProps } = props
  const ref = useRef<HTMLDivElement>(null)
  const rootContext = useMenuRootContext()
  const contentContext = useMenuContentContext()
  const composedRefs = useComposedRefs(forwardedRef, ref)
  const isPointerDownRef = useRef(false)

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

  return MenuItemImpl({
    ...itemProps,
    ref: composedRefs,
    disabled,
    onClick: composeEventHandlers(props.onClick, handleSelect),
    onPointerDown: event => {
      props.onPointerDown?.(event)
      isPointerDownRef.current = true
    },
    onPointerUp: composeEventHandlers(props.onPointerUp, event => {
      // Pointer down can move to a different menu item which should activate it on pointer up.
      // We dispatch a click for selection to allow composition with click based triggers and to
      // prevent Firefox from getting stuck in text selection mode when the menu closes.
      if (!isPointerDownRef.current) event.currentTarget?.click()
    }),
    onKeyDown: composeEventHandlers(props.onKeyDown, event => {
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
    }),
  })
})


/* ---------------------------------------------------------------------------------------------- */

type MenuItemImplElement = HTMLDivElement
interface MenuItemImplProps extends PrimitiveDivProps {
  disabled?: boolean
  textValue?: string
  children?: unknown
  'data-state'?: string
}

const MenuItemImpl = c<MenuItemImplProps>((props) => {
  const { disabled = false, ref: forwardedRef, textValue, ...itemProps } = props
  const contentContext = useMenuContentContext()
  const _ref = useRef<HTMLDivElement>(null)
  const composedRefs = useComposedRefs(forwardedRef, _ref)
  const [isFocused, setIsFocused] = useState(false)

  // get the item's `.textContent` as default strategy for typeahead `textValue`
  const [textContent, setTextContent] = useState('')
  useEffect(() => {
    const menuItem = _ref.current
    if (menuItem) {
      setTextContent((menuItem.textContent ?? '').trim())
    }
  }, [itemProps.children])

  return Collection.ItemSlot({
    disabled,
    textValue: textValue ?? textContent,
    children: html`<div
        role="menuitem"
        data-highlighted=${isFocused ? '' : undefined}
        aria-disabled=${disabled || undefined}
        data-disabled=${disabled ? '' : undefined}
        ${ref(composedRefs)}
        ${spread(itemProps)}
        onPointerMove=${composeEventHandlers(
      props.onPointerMove,
      whenMouse(event => {
        if (disabled) {
          contentContext.onItemLeave(event)
        } else {
          contentContext.onItemEnter(event)
        }
      }),
    )}
        onPointerLeave=${composeEventHandlers(
      props.onPointerLeave,
      whenMouse(event => contentContext.onItemLeave(event)),
    )}
        onFocus=${composeEventHandlers(props.onFocus, () => setIsFocused(true))}
        onBlur=${composeEventHandlers(props.onBlur, () => setIsFocused(false))}
      ></div>`
  })
})

/* -------------------------------------------------------------------------------------------------
 * MenuRadioGroup
 * -----------------------------------------------------------------------------------------------*/


const RadioGroupContext = createContext<MenuRadioGroup>({
  value: undefined,
  onValueChange: () => { },
})

const useRadioGroupContext = () => useContext(RadioGroupContext)

interface MenuRadioGroup extends MenuGroupProps {
  value?: string
  onValueChange?: (value: string) => void
}

const MenuRadioGroup = c<MenuRadioGroup>((props) => {
  const { value, onValueChange } = props
  const handleValueChange = useCallbackRef(onValueChange)
  return RadioGroupContext.Provider({
    value: {
      value,
      onValueChange: handleValueChange,
    },
    children: MenuGroup(props),
  })
})

/* -------------------------------------------------------------------------------------------------
 * MenuRadioItem
 * -----------------------------------------------------------------------------------------------*/

interface MenuRadioItem extends MenuItem {
  value: string
}

const MenuRadioItem = c<MenuRadioItem>(({ value, ...radioItemProps }) => {
  const context = useRadioGroupContext()
  const checked = value === context.value
  return ItemIndicatorContext.Provider({
    value: { checked },
    children: MenuItem({
      role: 'menuitemradio',
      'aria-checked': checked,
      ...radioItemProps,
      'data-state': getCheckedState(checked),
      onSelect: composeEventHandlers(radioItemProps.onSelect, () => context.onValueChange?.(value), {
        checkForDefaultPrevented: false,
      }),
    })
  })
})

/* -------------------------------------------------------------------------------------------------
 * MenuItemIndicator
 * -----------------------------------------------------------------------------------------------*/

const ItemIndicatorContext = createContext({
  checked: false,
})

const useItemIndicatorContext = () => useContext(ItemIndicatorContext)

interface PrimitiveSpanProps extends HTMLAttributes<HTMLSpanElement> { }
interface MenuItemIndicator extends PrimitiveSpanProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true
}

const MenuItemIndicator = c<MenuItemIndicator>(({ forceMount, ...props }) => {
  const indicatorContext = useItemIndicatorContext()
  return Presence({
    present: forceMount || indicatorContext.checked,
    children: html`<span
        ${spread(props)}
        data-state=${getCheckedState(indicatorContext.checked)}
      ></span>`
  })
})

/* -------------------------------------------------------------------------------------------------
 * MenuSeparator
 * -----------------------------------------------------------------------------------------------*/


interface MenuSeparator extends PrimitiveDivProps { }

const MenuSeparator = c<MenuSeparator>((props) => {
  return html`<div role="separator" data-orientation="horizontal" ${spread(props)}></div>`
})

/* -------------------------------------------------------------------------------------------------
 * MenuArrow
 * -----------------------------------------------------------------------------------------------*/

const MenuArrow = PopperArrow


/* -------------------------------------------------------------------------------------------------
 * MenuSub
 * -----------------------------------------------------------------------------------------------*/


type MenuSubContextValue = {
  contentId: string
  triggerId: string
  trigger: MenuSubTriggerElement | null
  onTriggerChange(trigger: MenuSubTriggerElement | null): void
}

const MenuSubContext = createContext<MenuSubContextValue>({} as any)

const useMenuSubContext = () => useContext(MenuSubContext)

interface MenuSubProps {
  children?: unknown
  open?: boolean
  onOpenChange?(open: boolean): void
}

const MenuSub = c<MenuSubProps>(props => {
  const { children, open = false, onOpenChange } = props
  const parentMenuContext = useMenuContext()
  const [trigger, setTrigger] = useState<MenuSubTriggerElement | null>(null)
  const [content, setContent] = useState<MenuContentElement | null>(null)
  const handleOpenChange = useCallbackRef(onOpenChange)

  // Prevent the parent menu from reopening with open submenus.
  useEffect(() => {
    if (parentMenuContext.open === false) handleOpenChange(false)
    return () => handleOpenChange(false)
  }, [parentMenuContext.open, handleOpenChange])

  return Popper({
    children: MenuContext.Provider({
      value: {
        open,
        onOpenChange: handleOpenChange,
        content,
        onContentChange: setContent,
      },
      children: MenuSubContext.Provider({
        value: {
          contentId: useId(),
          triggerId: useId(),
          trigger,
          onTriggerChange: setTrigger,
        },
        children,
      }),
    })
  })
})

/* -------------------------------------------------------------------------------------------------
 * MenuSubTrigger
 * -----------------------------------------------------------------------------------------------*/

type MenuSubTriggerElement = MenuItemImplElement
interface MenuSubTrigger extends MenuItemImplProps { }

const MenuSubTrigger = c<MenuSubTrigger>(
  (props) => {
    const context = useMenuContext()
    const rootContext = useMenuRootContext()
    const subContext = useMenuSubContext()
    const contentContext = useMenuContentContext()
    const openTimerRef = useRef<number | null>(null)
    const { pointerGraceTimerRef, onPointerGraceIntentChange } = contentContext

    const clearOpenTimer = useCallback(() => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }, [])

    useEffect(() => clearOpenTimer, [clearOpenTimer])

    useEffect(() => {
      const pointerGraceTimer = pointerGraceTimerRef.current
      return () => {
        window.clearTimeout(pointerGraceTimer)
        onPointerGraceIntentChange(null)
      }
    }, [pointerGraceTimerRef, onPointerGraceIntentChange])

    return MenuAnchor({
      children: MenuItemImpl({
        id: subContext.triggerId,
        'aria-haspopup': 'menu',
        'aria-expanded': context.open,
        'aria-controls': subContext.contentId,
        'data-state': getOpenState(context.open),
        ref: composeRefs(subContext.onTriggerChange),
        // This is redundant for mouse users but we cannot determine pointer type from
        // click event and we cannot use pointerup event (see git history for reasons why)
        onClick: event => {
          props.onClick?.(event)
          if (props.disabled || event.defaultPrevented) return
          if (!context.open) context.onOpenChange(true)
        },
        onPointerMove: composeEventHandlers(
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
        ),
        onPointerLeave: composeEventHandlers(
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
        ),
        onKeyDown: composeEventHandlers(props.onKeyDown, event => {
          const isTypingAhead = contentContext.searchRef.current !== ''
          if (props.disabled || (isTypingAhead && event.key === ' ')) return
          if (SUB_OPEN_KEYS[rootContext.dir].includes(event.key)) {
            context.onOpenChange(true)
            // prevent window from scrolling
            event.preventDefault()
          }
        }),
      })
    })
  },
)

/* -------------------------------------------------------------------------------------------------
 * MenuSubContent
 * -----------------------------------------------------------------------------------------------*/

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

const MenuSubContent = c<MenuSubContent>(({ ref: forwardedRef, ...props }) => {
  const context = useMenuContext()
  const rootContext = useMenuRootContext()
  const subContext = useMenuSubContext()
  const ref = useRef<MenuSubContentElement>(null)
  return Collection.Provider({
    children: Presence({
      present: context.open,
      children: Collection.Slot({
        children: MenuContentImpl({
          id: subContext.contentId,
          'aria-labelledby': subContext.triggerId,
          ...props,
          ref: composeRefs(ref, context.onContentChange),
          align: 'start',
          side: rootContext.dir === 'rtl' ? 'left' : 'right',
          disableOutsidePointerEvents: false,
          onFocusOutside: composeEventHandlers(props.onFocusOutside, event => {
            // We prevent closing when the trigger is focused to avoid triggering a re-open animation
            // on pointer interaction.
            if (event.target !== subContext.trigger) context.onOpenChange(false)
          }),
          onEscapeKeyDown: composeEventHandlers(props.onEscapeKeyDown, rootContext.onClose),
          onKeyDown: composeEventHandlers(props.onKeyDown, event => {
            // Submenu key events bubble through portals. We only care about keys in this menu.
            const isKeyDownInside = event.currentTarget.contains(event.target as HTMLElement)
            const isCloseKey = SUB_CLOSE_KEYS[rootContext.dir].includes(event.key)
            if (isKeyDownInside && isCloseKey) {
              context.onOpenChange(false)
              // prevent window from scrolling
              event.preventDefault()
            }
          })
        }),
      }),
    }),
  })
})

/* -----------------------------------------------------------------------------------------------*/

function getOpenState(open: boolean) {
  return open ? 'open' : 'closed'
}

function getCheckedState(checked: boolean) {
  return checked ? 'checked' : 'unchecked'
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

function isPointerInGraceArea(event: PointerEvent, area?: Polygon) {
  if (!area) return false
  const cursorPos = { x: event.clientX, y: event.clientY }
  return isPointInPolygon(cursorPos, area)
}

function whenMouse<E extends EventTarget>(handler: PointerEventHandler<E>): PointerEventHandler<E> {
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
