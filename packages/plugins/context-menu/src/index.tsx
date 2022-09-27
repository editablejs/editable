import { Editable } from '@editablejs/editor'
import { FC } from 'react'
import ReactDOM from 'react-dom'
import { styled } from 'twin.macro'
import {
  ContextMenu as UIContextMenu,
  ContextMenuItem as UIContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
} from '@editablejs/plugin-ui'

export interface ContextMenuOptions {}

type WithFunction = (editor: ContextMenuEditor) => void

const withSet = new Set<WithFunction>()
export interface ContextMenuEditor extends Editable {
  onContextMenu: (items: ContextMenuItem[]) => ContextMenuItem[]
}

export const ContextMenuEditor = {
  isContextMenuEditor(value: Editable): value is ContextMenuEditor {
    return 'onContextMenu' in value
  },

  with: (editor: Editable, fn: WithFunction) => {
    if (ContextMenuEditor.isContextMenuEditor(editor)) {
      fn(editor)
    } else {
      withSet.add(fn)
    }
  },
}

interface ContextMenuItem extends UIContextMenuItem {
  key: string
  title: JSX.Element | string
  index?: number
  href?: string
  children?: ContextMenuItem[]
}

interface ContextMenu extends UIContextMenu {
  items: (ContextMenuItem | 'separator')[]
}

const StyledContextMenu = styled(UIContextMenu)`
  min-width: 200px;
`

const ContextMenu: FC<ContextMenu> = ({ event, items }) => {
  const renderItems = (items: (ContextMenuItem | 'separator')[]) => {
    return items.map((item, index) => {
      if (typeof item === 'string') {
        if (index === 0) return null
        return <ContextMenuSeparator key={`${item}-${index}`} />
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
    })
  }

  return <StyledContextMenu event={event}>{renderItems(items)}</StyledContextMenu>
}

export const withContextMenu = <T extends Editable>(
  editor: T,
  options: ContextMenuOptions = {},
) => {
  const newEditor = editor as T & ContextMenuEditor

  const { onRenderFinish } = newEditor

  newEditor.onRenderFinish = () => {
    const contentlEl = Editable.toDOMNode(newEditor, newEditor)

    const root = document.createElement('div')
    contentlEl.after(root)

    const handleContextMenu = (e: MouseEvent) => {
      const items = newEditor.onContextMenu([])
      if (items.length > 0) {
        ReactDOM.render(
          <ContextMenu items={items.sort((a, b) => (a.index ?? 99) - (b.index ?? 99))} event={e} />,
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
    return items
  }

  withSet.forEach(fn => fn(newEditor))
  withSet.clear()

  return newEditor
}
