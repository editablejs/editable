import React, { FC, useCallback, useEffect, useState } from 'react'
import tw, { css } from 'twin.macro'
import { unbundleFocusRadixUi } from './utils'
import { Icon } from './icon'
import { Popper, PopperAnchor, PopperContent } from './popper'
import { DismissableLayer } from './dismissable-layer'
import { Anchor, Content, Item, Root, Separator, Sub, SubContent, SubTrigger } from './menu'
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
  tw`absolute left-3 top-0 my-2`,
  !disabled && tw`text-gray-500`,
  ...disabledCls(disabled),
]

const rightCls = (disabled?: boolean) => [
  tw`ml-auto pl-9`,
  !disabled && tw`text-gray-500`,
  ...disabledCls(disabled),
]

export const ContextMenuItem: FC<ContextMenuItem> = ({
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
    <Item
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
    </Item>
  )
}

export interface ContextMenuSub extends Omit<ContextMenuItem, 'rightText' | 'href' | 'onSelect'> {
  title?: JSX.Element | string
}

export const ContextMenuSub: FC<ContextMenuSub> = ({ title, icon, children, disabled }) => {
  return (
    <Sub>
      <SubTrigger disabled={disabled} css={itemCls(disabled)}>
        {icon && <span css={iconCls(disabled)}>{icon}</span>}
        {title}
        <div css={rightCls(disabled)}>
          <Icon name="arrowRight" />
        </div>
      </SubTrigger>
      <SubContent sideOffset={2} alignOffset={-5}>
        {children}
      </SubContent>
    </Sub>
  )
}

export interface ContextMenuSeparatorProps {
  className?: string
}

export const ContextMenuSeparator: FC<React.HTMLAttributes<HTMLDivElement>> = ({ className }) => {
  return (
    <Separator
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

type Point = { x: number; y: number }

export interface ContextMenu {
  container?: HTMLElement | Point
  className?: string
  onOpenChange?: (open: boolean) => void
}

export const ContextMenu: FC<ContextMenu> = ({
  container = document.body,
  className,
  onOpenChange,
  children,
}) => {
  const [open, setOpen] = useState(false)
  const pointRef = React.useRef<Point>(
    container instanceof HTMLElement ? { x: 0, y: 0 } : container,
  )
  const virtualRef = React.useRef({
    getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, ...pointRef.current }),
  })

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (onOpenChange) onOpenChange(open)
      setOpen(open)
    },
    [onOpenChange],
  )

  useEffect(() => {
    if (!(container instanceof HTMLElement)) return
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
    <Root open={open} onOpenChange={handleOpenChange}>
      <Anchor virtualRef={virtualRef} />
      <Content
        side="right"
        sideOffset={2}
        align="start"
        onEscapeKeyDown={() => handleOpenChange(false)}
        onPointerDownOutside={() => handleOpenChange(false)}
        css={[
          tw`z-50 overflow-hidden rounded border border-solid border-transparent bg-white py-2 shadow-[0_2px_6px_2px_rgb(60,64,67,0.15)]`,
          className,
        ]}
      >
        {children}
      </Content>
    </Root>
  )
}
