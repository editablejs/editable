import * as React from 'react'
import {
  ContextMenu as UIContextMenu,
  ContextMenuItem as UIContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuLabel,
  Portal,
} from '@editablejs/ui'
import { SideToolbarItem, useSideToolbarItems } from '../store'
import { Editable } from '@editablejs/editor'

export interface ContextMenu extends UIContextMenu {
  onSelect?: (event: React.MouseEvent) => void
  editor: Editable
}

export const ContextMenu: React.FC<ContextMenu> = ({
  editor,
  container,
  onSelect: onContextSelect,
  ...props
}) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const root = document.createElement('div')
    rootRef.current = root
    document.body.appendChild(root)
    return () => {
      document.body.removeChild(root)
      rootRef.current = null
    }
  }, [])

  const renderItem = (item: SideToolbarItem, index: number) => {
    if ('type' in item) {
      if (index === 0) return null
      return <ContextMenuSeparator key={`${item}-${index}`} />
    }
    if ('content' in item) {
      if (typeof item.content === 'function') {
        const Content = item.content
        return (
          <ContextMenuLabel key={`label-${index}`}>
            <Content onSelect={onContextSelect ?? (() => {})} />
          </ContextMenuLabel>
        )
      }
      return <ContextMenuLabel key={`label-${index}`}>{item.content}</ContextMenuLabel>
    }
    const { children, title, onSelect, href, ...rest } = item
    if (children && children.length > 0) {
      return (
        <ContextMenuSub title={title} {...rest}>
          {renderItems(children)}
        </ContextMenuSub>
      )
    }
    return (
      <UIContextMenuItem
        onSelect={event => {
          if (onContextSelect) onContextSelect(event)
          if (onSelect) onSelect(event)
        }}
        href={href}
        {...rest}
      >
        {title}
      </UIContextMenuItem>
    )
  }

  const renderItems = (items: SideToolbarItem[]) => {
    return items.map((item, index) => {
      return renderItem(item, index)
    })
  }

  const items = useSideToolbarItems(editor)

  return (
    <Portal container={rootRef.current}>
      <UIContextMenu container={container} {...props}>
        {renderItems(items)}
      </UIContextMenu>
    </Portal>
  )
}
