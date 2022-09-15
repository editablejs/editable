import { FC, useRef } from 'react'
import classNames from 'classnames'
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
import { useIsomorphicLayoutEffect } from '@editablejs/editor'
import { unbundleFocusRadixUi } from './utils'
import { Icon } from './icon'
export interface ContextMenuItem {
  icon?: JSX.Element
  rightText?: JSX.Element | string
  disabled?: boolean
  href?: string
  onSelect?: (e: React.MouseEvent<any>) => void
}

const disabledCls = (disabled?: boolean) => ({ 'ea-text-gray-400 ea-cursor-default': disabled })

const itemCls = (disabled?: boolean) =>
  classNames(
    'ea-relative ea-flex ea-cursor-pointer ea-items-center ea-py-2 ea-pl-9 ea-pr-3 ea-text-center hover:ea-bg-gray-100',
    disabledCls(disabled),
  )

const iconCls = (disabled?: boolean) =>
  classNames(
    'ea-absolute ea-left-3 ea-top-0 ea-my-2',
    { 'ea-text-gray-500': !disabled },
    disabledCls(disabled),
  )

const rightCls = (disabled?: boolean) =>
  classNames('ea-ml-auto ea-pl-9', { 'ea-text-gray-500': !disabled }, disabledCls(disabled))

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
        {icon && <span className={iconCls(disabled)}>{icon}</span>}
        {children}
        {rightText && <div className={rightCls(disabled)}>{rightText}</div>}
      </>
    )
  }
  return (
    <Item
      className={itemCls(disabled)}
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
      <SubTrigger disabled={disabled} className={itemCls(disabled)}>
        {icon && <span className={iconCls(disabled)}>{icon}</span>}
        {title}
        <div className={rightCls(disabled)}>
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
  return <Separator className={classNames('ea-h-{1} ea-my-1 ea-bg-gray-300', className)} />
}

export interface ContextMenu extends Omit<UIContextMenuProps, 'modal'> {
  event: MouseEvent
  className?: string
}

export const ContextMenu: FC<ContextMenu> = ({ event, className, children, ...props }) => {
  const triggerRef = useRef<HTMLSpanElement | null>(null)

  useIsomorphicLayoutEffect(() => {
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
        className={classNames(
          'ea-z-50 ea-overflow-hidden ea-rounded ea-border ea-border-solid ea-border-transparent ea-bg-white ea-py-2 ea-shadow-[0_2px_6px_2px_rgb(60,64,67,0.15)]',
          className,
        )}
      >
        {children}
      </Content>
    </Root>
  )
}
