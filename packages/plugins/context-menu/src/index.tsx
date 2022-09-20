import { Editable } from '@editablejs/editor'
import { FC } from 'react'
import ReactDOM from 'react-dom'
import { styled } from 'twin.macro'
import {
  ContextMenu as UIContextMenu,
  ContextMenuItem as UIContextMenuItem,
  ContextMenuSub,
} from '@editablejs/plugin-ui'

export interface ContextMenuOptions {}

export interface ContextMenuEditor extends Editable {
  onContextMenu: (items: ContextMenuItem[]) => ContextMenuItem[]
}

export const ContextMenuEditor = {
  isContextMenuEditor(value: Editable): value is ContextMenuEditor {
    return 'onContextMenu' in value
  },

  onContextMenu: (editor: Editable, items: ContextMenuItem[]) => {
    if (ContextMenuEditor.isContextMenuEditor(editor)) {
      return editor.onContextMenu(items)
    }
    return items
  },
}

interface ContextMenuItem extends UIContextMenuItem {
  key: string
  title: JSX.Element | string
  sort?: number
  href?: string
  children?: ContextMenuItem[]
}

interface ContextMenu extends UIContextMenu {
  items: ContextMenuItem[]
}

const StyledContextMenu = styled(UIContextMenu)`
  min-width: 200px;
`

const ContextMenu: FC<ContextMenu> = ({ event, items }) => {
  const renderItems = (items: ContextMenuItem[]) => {
    return items.map(({ children, title, onSelect, href, ...item }) => {
      if (children && children.length > 0) {
        return (
          <ContextMenuSub title={title} {...item}>
            {renderItems(children)}
          </ContextMenuSub>
        )
      }
      return (
        <UIContextMenuItem onSelect={onSelect} href={href} {...item}>
          {title}
        </UIContextMenuItem>
      )
    })
  }

  return <StyledContextMenu event={event}>{renderItems(items)}</StyledContextMenu>
}

export const withContextMenu = <T extends Editable>(
  editor: T,
  options: ContextMenuOptions = {},
) => {
  const newEditor = editor as T & ContextMenuEditor

  const { onRenderFinish, onContextMenu } = newEditor

  newEditor.onRenderFinish = () => {
    const contentlEl = Editable.toDOMNode(newEditor, newEditor)

    const root = document.createElement('div')
    contentlEl.after(root)

    const handleContextMenu = (e: MouseEvent) => {
      const items = newEditor.onContextMenu([])
      if (items.length > 0) {
        ReactDOM.render(
          <ContextMenu items={items.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))} event={e} />,
          root,
        )
      }
    }

    contentlEl.addEventListener('contextmenu', handleContextMenu)

    const destory = onRenderFinish()

    return () => {
      contentlEl.removeEventListener('contextmenu', handleContextMenu)
      if (destory) destory()
      root.parentNode?.removeChild(root)
    }
  }

  newEditor.onContextMenu = items => {
    return onContextMenu ? onContextMenu(items) : items
  }

  return newEditor
}
