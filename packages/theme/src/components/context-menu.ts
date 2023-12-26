
import tw, { css } from 'twin.macro'
import { Icon } from './icon'
import {
  MenuAnchor,
  MenuContent,
  MenuItem,
  Menu,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from './menu'
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'
import { HTMLAttributes, createContext, html, useCallback, useContext, useEffect, useRef, useState, c } from 'rezon'
import { when } from 'rezon/directives/when'

export interface ContextMenuItemProps {
  icon?: JSX.Element
  rightText?: JSX.Element | string
  disabled?: boolean
  href?: string
  children?: unknown
  onSelect?: (e: MouseEvent) => void
}

const sizeCls = (size: ContextMenuSize = 'default') => [
  tw`py-1`,
  size === 'small' && tw`py-0.5`,
  size === 'large' && tw`py-2`,
]

const disabledCls = (disabled?: boolean) => [disabled && tw`text-gray-400 cursor-default`]

const itemCls = (disabled?: boolean, size?: ContextMenuSize) => [
  tw`relative flex cursor-pointer items-center pl-7 pr-2 text-center hover:bg-gray-100`,
  size === 'small' && `pr-1 pl-3`,
  size === 'large' && `pr-3 pl-9`,
  ...sizeCls(size),
  ...disabledCls(disabled),
]

const iconCls = (disabled?: boolean, size?: ContextMenuSize) => [
  tw`absolute left-2 top-0 flex items-center h-full`,
  size === 'small' && `left-1`,
  size === 'large' && `left-3`,
  !disabled && tw`text-gray-500`,
  ...disabledCls(disabled),
]

const rightCls = (disabled?: boolean, size?: ContextMenuSize) => [
  tw`ml-auto pl-6`,
  size === 'small' && `pl-3`,
  size === 'large' && `pl-9`,
  !disabled && tw`text-gray-500`,
  ...disabledCls(disabled),
]

export const ContextMenuItem = c<ContextMenuItemProps>(({
  icon,
  rightText,
  children,
  disabled,
  href,
  onSelect,
}) => {
  const size = useContextMenuSize()

  const render = () => {
    return html`${when(icon, () => html`<span css=${iconCls(disabled, size)}>${icon}</span>`)}
    ${children}
    ${when(rightText, () => html`<div css=${rightCls(disabled, size)}>${rightText}</div>`)}`
  }
  return MenuItem({
    className: css`${itemCls(disabled, size)}`,
    onMouseDown: e => {
      e.preventDefault()
      if (onSelect) onSelect(e)
    },
    disabled,
    children: href ? html`<a href=${href} target="_blank" rel="noreferrer">${render()}</a>` : render(),
  })
})

export interface ContextMenuSubProps extends Omit<ContextMenuItemProps, 'rightText' | 'href' | 'onSelect'> {
  title?: unknown
}

export const ContextMenuSub = c<ContextMenuSubProps>(({ title, icon, children, disabled }) => {
  return MenuSub({
    children: html`${MenuSubTrigger({
      disabled,
      className: css`${itemCls(disabled)}`,
      children: html`${when(icon, () => html`<span css=${iconCls(disabled)}>${icon}</span>`)}
        ${title}
        <div css=${rightCls(disabled)}>${Icon({ name: 'arrowRight' })}</div>
        `
    })
      }
    ${MenuSubContent({
        sideOffset: 2,
        alignOffset: -5,
        children
      })
      }
    `
  })
})

export interface ContextMenuSeparatorProps {
  className?: string
}

export const ContextMenuSeparator = c<HTMLAttributes<HTMLDivElement>>(({
  className,
}) => {
  return MenuSeparator({
    className: css([tw`my-1 bg-gray-300`, className]),
  })
})

export const ContextMenuLabel = c<Omit<HTMLAttributes<HTMLDivElement>, 'title'>>(({
  children,
  className,
}) => {
  const size = useContextMenuSize()
  return html`<div class=${css([
    tw`px-2 text-gray-500`,
    sizeCls(size),
    size === 'small' && tw`px-1`,
    size === 'large' && tw`px-3`,
    className
  ])}>${children}</div>`;
})

export type Point = { x: number; y: number }

const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left'] as const
const ALIGN_OPTIONS = ['start', 'center', 'end'] as const

type Side = (typeof SIDE_OPTIONS)[number]
type Align = (typeof ALIGN_OPTIONS)[number]

type ContextMenuSize = 'small' | 'default' | 'large'
export interface ContextMenuProps {
  container?: HTMLElement | Point
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: Side
  align?: Align
  minWidth?: number
  size?: ContextMenuSize
  children?: unknown
}

const ContextMenuContext = createContext<{ size: ContextMenuSize }>({
  size: 'default',
})

const useContextMenuSize = () => {
  const context = useContext(ContextMenuContext)
  return context.size
}

export const ContextMenu = c<ContextMenuProps>(({
  container = document.body,
  className,
  open: openProps,
  onOpenChange,
  children,
  side = 'right',
  align = 'start',
  size = 'default',
  minWidth,
}) => {
  const [open, setOpen] = useState(openProps)
  const pointRef = useRef<Point>(
    container instanceof HTMLElement ? { x: 0, y: 0 } : container,
  )
  const virtualRef = useRef({
    getBoundingClientRect: () =>
      DOMRect.fromRect({
        width: 0,
        height: 0,
        ...pointRef.current,
      }),
  })

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (onOpenChange) onOpenChange(open)
      setOpen(open)
    },
    [onOpenChange],
  )

  useIsomorphicLayoutEffect(() => {
    setOpen(openProps)
  }, [openProps])

  useEffect(() => {
    if (!(container instanceof HTMLElement)) {
      pointRef.current = container
      return
    }
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      pointRef.current = { x: e.clientX, y: e.clientY }
      handleOpenChange(true)
    }
    container.addEventListener('contextmenu', handleContextMenu)

    return () => {
      container.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [container, handleOpenChange])

  return ContextMenuContext.Provider({
    value: { size },
    children: Menu({
      open,
      onOpenChange: handleOpenChange,
      children: html`${MenuAnchor({
        virtualRef,
        children: Menu({
          open,
          onOpenChange: handleOpenChange,
        }),
      })}${MenuContent({
        side,
        sideOffset: 2,
        align,
        onEscapeKeyDown: () => handleOpenChange(false),
        onPointerDownOutside: () => handleOpenChange(false),
        className: css([
          tw`z-50 py-1 text-base overflow-hidden rounded shadow-outer border border-solid border-gray-300 bg-white`,
          minWidth !== undefined &&
          css`
              min-width: ${minWidth}px;
            `,
          size === 'large' && tw`py-2 text-lg`,
          size === 'small' && tw`py-0.5 text-sm`,
          className
        ]),
        children,
      })
        }`,
    })
  })
})

