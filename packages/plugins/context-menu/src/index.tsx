import {
  Editable,
  Slot,
  useEditableStatic,
  useIsomorphicLayoutEffect,
  useSlotActive,
  Locale,
  useLocale,
} from '@editablejs/editor'
import * as React from 'react'
import {
  ContextMenu as UIContextMenu,
  ContextMenuItem as UIContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  Portal,
  Point,
  ContextMenuLabel,
} from '@editablejs/ui'
import { ContextMenuItem, useContextMenuItems, useContextMenuOpen } from './store'
import locale, {ContextMenuItems} from './locale';

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
  onSelect?: (event: React.MouseEvent) => void
}

const ContextMenu: React.FC<ContextMenu> = ({
  container,
  items,
  onSelect: onSelectProps,
  ...props
}) => {
  const ItemsLocale = useLocale<ContextMenuItems>('contextMenuItems')
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
    const { key, children, title, onSelect, href, ...rest } = item
    if (children && children.length > 0) {
      return (
        <ContextMenuSub title={ItemsLocale[key] || title} {...rest} key={key}>
          {renderItems(children)}
        </ContextMenuSub>
      )
    }
    return (
      <UIContextMenuItem onSelect={onSelect} href={href} {...rest}>
        {ItemsLocale[key] || title}
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

const ContextMenuPortal = () => {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const containerRef = React.useRef<HTMLElement | null>(null)

  const editor = useEditableStatic()
  const [open, setOpen] = useContextMenuOpen(editor)
  const items = useContextMenuItems(editor)
  const [point, setPoint] = React.useState<Point>({ x: 0, y: 0 })

  React.useEffect(() => {
    containerRef.current = Editable.toDOMNode(editor, editor)
    const root = document.createElement('div')
    rootRef.current = root
    document.body.appendChild(root)

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      setPoint({ x: e.clientX, y: e.clientY })
      setOpen(true)
    }
    editor.on('contextmenu', handleContextMenu)
    return () => {
      editor.off('contextmenu', handleContextMenu)
      document.body.removeChild(root)
      rootRef.current = null
    }
  }, [editor, setOpen])

  Locale.setLocale(editor, locale)

  const [active] = useSlotActive(ContextMenuPortal)

  useIsomorphicLayoutEffect(() => {
    if (active === false) {
      setOpen(false)
    }
  }, [active])

  useIsomorphicLayoutEffect(() => {
    if (open) {
      Slot.update(editor, { active: false }, c => c !== ContextMenuPortal)
      Slot.update(editor, { active: true }, c => c === ContextMenuPortal)
    }
  }, [editor, open])

  if (containerRef.current && rootRef.current)
    return (
      <Portal container={rootRef.current}>
        <ContextMenu
          open={open}
          items={items}
          container={point}
          onOpenChange={setOpen}
          onSelect={() => setOpen(false)}
          minWidth={200}
        />
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

  Slot.mount(editor, ContextMenuPortal)
  newEditor.on('destory', () => {
    Slot.unmount(editor, ContextMenuPortal)
  })
  return newEditor
}

export * from './store'
