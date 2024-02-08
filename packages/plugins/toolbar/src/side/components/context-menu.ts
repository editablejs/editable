import {
  ContextMenuProps,
  ContextMenu as UIContextMenu,
  ContextMenuItem as UIContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuLabel,
  Portal,
} from '@editablejs/theme'
import { SideToolbarItem, useSideToolbarItems } from '../store'
import { Editable } from '@editablejs/editor'
import { c, useEffect, useRef } from 'rezon'
import { repeat } from 'rezon/directives/repeat'

export interface ContextMenu extends ContextMenuProps {
  onSelect?: (event: MouseEvent) => void
  editor: Editable
}

export const ContextMenu = c<ContextMenu>(({
  editor,
  container,
  onSelect: onContextSelect,
  ...props
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const root = document.createElement('div')
    rootRef.current = root
    document.body.appendChild(root)
    return () => {
      document.body.removeChild(root)
      rootRef.current = null
    }
  }, [])

  const renderItem = (item: SideToolbarItem, index: number): unknown => {
    if ('type' in item) {
      if (index === 0) return null
      return ContextMenuSeparator({})
    }
    if ('content' in item) {
      if (typeof item.content === 'function') {
        const Content = item.content
        return ContextMenuLabel({
          children: Content({ onSelect: onContextSelect ?? (() => { }) }),
        });
      }
      return ContextMenuLabel({ children: item.content })
    }
    const { children, title, onSelect, href, ...rest } = item
    if (children && children.length > 0) {
      return ContextMenuSub({ title, ...rest, children: renderItems(children) })
    }
    return UIContextMenuItem({
      onSelect: event => {
        if (onContextSelect) onContextSelect(event)
        if (onSelect) onSelect(event)
      },
      href,
      ...rest,
      children: title,
    })
  }

  const renderItems = (items: SideToolbarItem[]) => {
    return items.map((item, index) => {
      return renderItem(item, index)
    })
  }

  const items = useSideToolbarItems(editor)

  return Portal({
    container: rootRef.current,
    children: UIContextMenu({ container, ...props, children: repeat(items, (_, index) => index, (item, index) => renderItem(item, index)) }),
  })
})
