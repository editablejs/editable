import {
  Editable,
  useEditable,
  useEditableStatic,
  useIsomorphicLayoutEffect,
} from '@editablejs/editor'
import { FC, useState } from 'react'
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

interface ContextMenuItemBase extends UIContextMenuItem {
  key: string
  title: JSX.Element | string
  index?: number
  href?: string
  children?: ContextMenuItem[]
}

type ContextMenuItem =
  | ContextMenuItemBase
  | {
      type: 'separator'
      index?: number
    }

interface ContextMenu extends UIContextMenu {
  items: ContextMenuItem[]
}

const StyledContextMenu = styled(UIContextMenu)`
  min-width: 200px;
`

const ContextMenu: FC<ContextMenu> = ({ event, items }) => {
  const renderItems = (items: ContextMenuItem[]) => {
    return items.map((item, index) => {
      if ('type' in item) {
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

const ContextComponent = () => {
  const [items, setItems] = useState<ContextMenuItem[]>([])
  const [event, setEvent] = useState<MouseEvent | null>(null)

  const editor = useEditableStatic() as ContextMenuEditor

  useIsomorphicLayoutEffect(() => {
    const container = Editable.toDOMNode(editor, editor)
    const handleContextMenu = (e: MouseEvent) => {
      setItems(editor.onContextMenu([]))
      setEvent(e)
    }
    container.addEventListener('contextmenu', handleContextMenu)
    return () => {
      container.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [editor])

  if (items.length > 0 && event)
    return (
      <ContextMenu items={items.sort((a, b) => (a.index ?? 99) - (b.index ?? 99))} event={event} />
    )
  return null
}

export const withContextMenu = <T extends Editable>(
  editor: T,
  options: ContextMenuOptions = {},
) => {
  const newEditor = editor as T & ContextMenuEditor

  const { onRenderContextComponents } = newEditor

  newEditor.onRenderContextComponents = components => {
    components.push(ContextComponent)
    return onRenderContextComponents(components)
  }

  newEditor.onContextMenu = items => {
    return items
  }

  withSet.forEach(fn => fn(newEditor))
  withSet.clear()

  return newEditor
}
