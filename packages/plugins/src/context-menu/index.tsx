import { Editable } from '@editablejs/editor'
import { FC } from 'react'
import {
  ContextMenu as UIContextMenu,
  ContextMenuItem as UIContextMenuItem,
  ContextMenuSub,
} from '../ui'

export interface ContextMenuOptions {}

export interface ContextMenuEditor extends Editable {}

interface ContextMenuItem extends UIContextMenuItem {
  key: string
  title: JSX.Element | string
  children?: ContextMenuItem[]
}

interface ContextMenu extends UIContextMenu {
  items: ContextMenuItem[]
}

const ContextMenu: FC<ContextMenu> = ({ event, items }) => {
  const renderItems = (items: ContextMenuItem[]) => {
    return items.map(({ children, title, ...items }) => {
      if (children && children.length > 0) {
        return (
          <ContextMenuSub title={title} {...items}>
            {renderItems(children)}
          </ContextMenuSub>
        )
      }
      return <UIContextMenuItem {...items}>{title}</UIContextMenuItem>
    })
  }

  return (
    <UIContextMenu className="ea-context-menu" event={event}>
      {renderItems(items)}
    </UIContextMenu>
  )
}

export const withContextMenu = <T extends Editable>(
  editor: T,
  options: ContextMenuOptions = {},
) => {
  const newEditor = editor as T & ContextMenuEditor

  const { onContextMenu } = newEditor

  newEditor.onContextMenu = (e: MouseEvent, items) => {
    onContextMenu(e, items)
    return items.length > 0 ? (
      <ContextMenu items={items.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))} event={e} />
    ) : null
  }

  return newEditor
}
