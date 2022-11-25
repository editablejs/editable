import { Editable, useEditableStatic, useIsomorphicLayoutEffect } from '@editablejs/editor'
import { FC, useRef } from 'react'
import { styled } from 'twin.macro'
import {
  ContextMenu as UIContextMenu,
  ContextMenuItem as UIContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  Portal,
} from '@editablejs/plugin-ui'
import { ContextMenuItem, useContextMenuItems, useContextMenuOpened } from './store'

export interface ContextMenuOptions {}

export const CONTEXT_MENU_OPTIONS = new WeakMap<Editable, ContextMenuOptions>()
export interface ContextMenuEditor extends Editable {}

export const ContextMenuEditor = {
  getOptions: (editor: Editable): ContextMenuOptions => {
    return CONTEXT_MENU_OPTIONS.get(editor) ?? {}
  },
}

interface ContextMenu extends UIContextMenu {
  items: ContextMenuItem[]
}

const StyledContextMenu = styled(UIContextMenu)`
  min-width: 200px;
`

const ContextMenu: FC<ContextMenu> = ({ container, items, ...props }) => {
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

  return (
    <StyledContextMenu container={container} {...props}>
      {renderItems(items)}
    </StyledContextMenu>
  )
}

const ContextMenuPortal = () => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  const editor = useEditableStatic()
  const [_, setOpened] = useContextMenuOpened(editor)
  const items = useContextMenuItems(editor)

  useIsomorphicLayoutEffect(() => {
    containerRef.current = Editable.toDOMNode(editor, editor)
    const root = document.createElement('div')
    rootRef.current = root
    document.body.appendChild(root)
    return () => {
      document.body.removeChild(root)
    }
  }, [editor])

  if (containerRef.current && rootRef.current)
    return (
      <Portal container={rootRef.current}>
        <ContextMenu items={items} container={containerRef.current} onOpenChange={setOpened} />
      </Portal>
    )
  return null
}

export const withContextMenu = <T extends Editable>(
  editor: T,
  options: ContextMenuOptions = {},
) => {
  const newEditor = editor as T & ContextMenuEditor

  CONTEXT_MENU_OPTIONS.set(newEditor, options)

  Editable.mountSlot(editor, ContextMenuPortal)

  return newEditor
}

export * from './store'
