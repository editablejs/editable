import {
  ContextMenu as UIContextMenu,
  ContextMenuItem as UIContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuLabel,
} from '@editablejs/ui'

import { ContextMenuItem } from '../store'

interface ContextMenu extends UIContextMenu {
  items: ContextMenuItem[]
  onSelect?: (event: React.MouseEvent) => void
}

export const ContextMenu: React.FC<ContextMenu> = ({
  container,
  items,
  onSelect: onSelectProps,
  ...props
}) => {
  const renderItem = (item: ContextMenuItem, index: number) => {
    if ('type' in item) {
      if (index === 0) return null
      return <ContextMenuSeparator key={`${item}-${index}`} />
    }
    if ('content' in item) {
      if (typeof item.content === 'function') {
        const Content = item.content
        return (
          <ContextMenuLabel key={`label-${index}`}>
            <Content onSelect={onSelectProps ?? (() => {})} />
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
      <UIContextMenuItem onSelect={onSelect} href={href} {...rest}>
        {title}
      </UIContextMenuItem>
    )
  }

  const renderItems = (items: ContextMenuItem[]) => {
    return items.map(renderItem)
  }

  return (
    <UIContextMenu container={container} {...props}>
      {renderItems(items)}
    </UIContextMenu>
  )
}
