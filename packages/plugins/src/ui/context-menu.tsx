import { FC, useRef } from 'react'
import {
  Content,
  Item,
  Root,
  Trigger,
  ContextMenuProps as UIContextMenuProps,
  ItemIndicator,
  Sub,
  SubTrigger,
  SubContent,
  Separator,
} from '@radix-ui/react-context-menu'
import { useIsomorphicLayoutEffect } from '@editablejs/editor'
import { unbundleFocusRadixUi } from './utils'
import classNames from 'classnames'
export interface ContextMenuItem {
  icon?: JSX.Element
  rightText?: JSX.Element | string
}

export const ContextMenuItem: FC<ContextMenuItem> = ({ icon, rightText, children }) => {
  return (
    <Item
      className="ea-relative ea-flex ea-cursor-pointer ea-items-center ea-py-1 ea-pl-6 ea-pr-3 ea-text-center hover:ea-bg-gray-100"
      onMouseDown={e => e.preventDefault()}
      ref={unbundleFocusRadixUi}
    >
      {icon && (
        <ItemIndicator className="ea-absolute ea-left-0 ea-top-1 ea-w-6 ea-text-gray-400">
          {icon}
        </ItemIndicator>
      )}
      {children}
      {rightText && <div className="ea-ml-auto ea-pl-3">{rightText}</div>}
    </Item>
  )
}

export interface ContextMenuSub extends ContextMenuItem {
  title?: JSX.Element | string
}

export const ContextMenuSub: FC<ContextMenuSub> = ({ title, icon, rightText, children }) => {
  return (
    <Sub>
      <SubTrigger>
        {icon && (
          <ItemIndicator className="ea-absolute ea-left-0 ea-top-1 ea-w-6 ea-text-gray-400">
            {icon}
          </ItemIndicator>
        )}
        {title}
        {rightText && <div className="ea-ml-auto ea-pl-3">{rightText}</div>}
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
          'ea-z-50 ea-overflow-hidden ea-rounded-sm ea-border ea-border-solid ea-border-gray-200 ea-bg-white ea-text-sm ea-shadow-md',
          className,
        )}
      >
        {children}
      </Content>
    </Root>
  )
}
