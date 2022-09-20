import { FC, useLayoutEffect, useRef } from 'react'
import tw from 'twin.macro'
import {
  Content,
  Item,
  Root,
  Trigger,
  ContextMenuProps as UIContextMenuProps,
  Sub,
  SubTrigger,
  SubContent,
  Separator,
} from '@radix-ui/react-context-menu'
import { unbundleFocusRadixUi } from './utils'
import { Icon } from './icon'
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
      ref={unbundleFocusRadixUi}
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

export const ContextMenuSeparator: FC<HTMLDivElement> = ({ className }) => {
  return <Separator css={[tw`h-[1] my-1 bg-gray-300`, className]} />
}

export interface ContextMenu extends Omit<UIContextMenuProps, 'modal'> {
  event: MouseEvent
  className?: string
}

export const ContextMenu: FC<ContextMenu> = ({ event, className, children, ...props }) => {
  const triggerRef = useRef<HTMLSpanElement | null>(null)

  useLayoutEffect(() => {
    const e = document.createEvent('MouseEvents')
    e.initMouseEvent(
      'contextmenu',
      true,
      false,
      window,
      event.detail,
      event.screenX,
      event.screenY,
      event.clientX,
      event.clientY,
      false,
      false,
      false,
      false,
      2,
      null,
    )
    event.preventDefault()
    triggerRef.current?.dispatchEvent(e)
  }, [event])

  return (
    <Root {...props} modal={false}>
      <Trigger ref={ref => unbundleFocusRadixUi(ref, triggerRef)} />
      <Content
        ref={unbundleFocusRadixUi}
        loop={true}
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
