import * as React from 'react'
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
import { useIsomorphicLayoutEffect } from './utils'
export interface ContextMenuItem {
  icon?: JSX.Element
  rightText?: JSX.Element | string
  disabled?: boolean
  href?: string
  onSelect?: (e: React.MouseEvent<any>) => void
}

const disabledCls = (disabled?: boolean) => [disabled && tw`text-gray-400 cursor-default`]

const itemCls = (disabled?: boolean) => [
  tw`relative flex cursor-pointer items-center py-2 pl-9 pr-3 text-center hover:bg-gray-100`,
  ...disabledCls(disabled),
]

const iconCls = (disabled?: boolean) => [
  tw`absolute left-3 top-0 flex items-center h-full`,
  !disabled && tw`text-gray-500`,
  ...disabledCls(disabled),
]

const rightCls = (disabled?: boolean) => [
  tw`ml-auto pl-9`,
  !disabled && tw`text-gray-500`,
  ...disabledCls(disabled),
]

export const ContextMenuItem: React.FC<ContextMenuItem> = ({
  icon,
  rightText,
  children,
  disabled,
  href,
  onSelect,
}) => {
  const render = () => {
    return (
      <>
        {icon && <span css={iconCls(disabled)}>{icon}</span>}
        {children}
        {rightText && <div css={rightCls(disabled)}>{rightText}</div>}
      </>
    )
  }
  return (
    <MenuItem
      css={itemCls(disabled)}
      onMouseDown={e => {
        e.preventDefault()
        if (onSelect) onSelect(e)
      }}
      disabled={disabled}
    >
      {href ? (
        <a href={href} target="_blank" rel="noreferrer">
          {render()}
        </a>
      ) : (
        render()
      )}
    </MenuItem>
  )
}

export interface ContextMenuSub extends Omit<ContextMenuItem, 'rightText' | 'href' | 'onSelect'> {
  title?: JSX.Element | string
}

export const ContextMenuSub: React.FC<ContextMenuSub> = ({ title, icon, children, disabled }) => {
  return (
    <MenuSub>
      <MenuSubTrigger disabled={disabled} css={itemCls(disabled)}>
        {icon && <span css={iconCls(disabled)}>{icon}</span>}
        {title}
        <div css={rightCls(disabled)}>
          <Icon name="arrowRight" />
        </div>
      </MenuSubTrigger>
      <MenuSubContent sideOffset={2} alignOffset={-5}>
        {children}
      </MenuSubContent>
    </MenuSub>
  )
}

export interface ContextMenuSeparatorProps {
  className?: string
}

export const ContextMenuSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
}) => {
  return (
    <MenuSeparator
      css={[
        tw`my-1 bg-gray-300`,
        css`
          height: 1px;
        `,
        className,
      ]}
    />
  )
}

export const ContextMenuLabel: React.FC<Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>> = ({
  children,
  className,
}) => {
  return (
    <div tw="py-2 pl-3 pr-3 text-gray-500" className={className}>
      {children}
    </div>
  )
}

export type Point = { x: number; y: number }

const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left'] as const
const ALIGN_OPTIONS = ['start', 'center', 'end'] as const

type Side = typeof SIDE_OPTIONS[number]
type Align = typeof ALIGN_OPTIONS[number]
export interface ContextMenu {
  container?: HTMLElement | Point
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: Side
  align?: Align
  minWidth?: number
}

export const ContextMenu: React.FC<ContextMenu> = ({
  container = document.body,
  className,
  open: openProps,
  onOpenChange,
  children,
  side = 'right',
  align = 'start',
  minWidth = 200,
}) => {
  const [open, setOpen] = React.useState(openProps)
  const pointRef = React.useRef<Point>(
    container instanceof HTMLElement ? { x: 0, y: 0 } : container,
  )
  const virtualRef = React.useRef({
    getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, ...pointRef.current }),
  })

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (onOpenChange) onOpenChange(open)
      setOpen(open)
    },
    [onOpenChange],
  )

  useIsomorphicLayoutEffect(() => {
    setOpen(openProps)
  }, [openProps])

  React.useEffect(() => {
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

  return (
    <Menu open={open} onOpenChange={handleOpenChange}>
      <MenuAnchor virtualRef={virtualRef} />
      <MenuContent
        side={side}
        sideOffset={2}
        align={align}
        onEscapeKeyDown={() => handleOpenChange(false)}
        onPointerDownOutside={() => handleOpenChange(false)}
        css={[
          tw`z-50 overflow-hidden rounded border border-solid border-gray-300 bg-white py-2 shadow-outer`,
          css`
            min-width: ${minWidth}px;
          `,
          className,
        ]}
      >
        {children}
      </MenuContent>
    </Menu>
  )
}
