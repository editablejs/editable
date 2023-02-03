import {
  useEditableStatic,
  Editable,
  useSlotActive,
  useIsomorphicLayoutEffect,
  Slot,
} from '@editablejs/editor'

import { Portal, Point } from '@editablejs/ui'
import React from 'react'
import { ContextMenu } from './context-menu'
import { useContextMenuOpen, useContextMenuItems } from '../store'

export const ContextMenuPortal = () => {
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

  React.useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (open) event.preventDefault()
    }
    editor.on('keydown', handleKeydown)
    return () => {
      editor.off('keydown', handleKeydown)
    }
  }, [open])

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
