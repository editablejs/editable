
import {
  Editable,
  useEditableStatic,
  Slot,
  SelectionDrawing,
  useSlotActive,
  useIsomorphicLayoutEffect,
  useLocale,
} from '@editablejs/editor'
import { Descendant, Range } from '@editablejs/models'
import { Measurable, Popover, PopoverAnchor, PopoverContent, PopoverPortal } from '@editablejs/theme'

import { useInlineToolbarItems, useInlineToolbarOpen } from '../store'
import { Toolbar } from '../../components/toolbar'
import { InlineToolbarLocale } from '../locale'
import { useRef, useState, useCallback, useEffect } from 'rezon'

export const InlineToolbar = () => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  const editor = useEditableStatic()

  const items = useInlineToolbarItems(editor)

  const [open, setOpen] = useInlineToolbarOpen(editor)

  const [side, setSide] = useState<'bottom' | 'top'>('bottom')

  const pointRef = useRef({ x: 0, y: 0 })
  const virtualRef = useRef<Measurable>({
    getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, ...pointRef.current }),
  })

  const updatePoint = useCallback(() => {
    const { selection } = editor
    if (!selection) return
    let x = 0,
      y = 0

    const rects = SelectionDrawing.toRects(editor, selection, false)
    const isBackward = Range.isBackward(selection)
    if (rects.length > 0) {
      const rect = isBackward ? rects[0] : rects[rects.length - 1]
      x = isBackward ? rect.x : rect.right
      y = isBackward ? rect.y : rect.bottom
    } else {
      const range = Editable.toDOMRange(editor, selection)
      range.collapse(isBackward)
      const rect = range.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        setOpen(false)
        return
      }
      x = isBackward ? rect.x : rect.right
      y = isBackward ? rect.y : rect.bottom
    }

    pointRef.current = {
      x,
      y,
    }
    setSide(isBackward ? 'top' : 'bottom')
  }, [editor, setOpen, setSide])

  const handleOpen = useCallback(
    (force = false) => {
      const { selection } = editor
      if (selection && (Range.isExpanded(selection) || force)) {
        updatePoint()
        setOpen(value => {
          if (value) {
            document.dispatchEvent(new CustomEvent('refreshInlineToolbarPosition'))
          }
          return true
        })
      } else {
        setOpen(false)
      }
    },
    [editor, setOpen, updatePoint],
  )

  const isRootMouseDown = useRef(false)

  const handleSelectStart = useCallback(() => {
    if (!isRootMouseDown.current) setOpen(false)
  }, [setOpen])

  const handleSelectionChange = useCallback(() => {
    const { selection } = editor
    if (!selection || Range.isCollapsed(selection)) {
      setOpen(false)
    }
  }, [editor, setOpen])

  const [contentChanged, setContentChanged] = useState<Descendant[]>([])

  useEffect(() => {
    if (!open) return
    updatePoint()
    document.dispatchEvent(new CustomEvent('refreshInlineToolbarPosition'))
  }, [open, contentChanged, updatePoint])

  useEffect(() => {
    containerRef.current = Editable.toDOMNode(editor, editor)
    const root = document.createElement('div')

    const handleMouseDown = () => {
      isRootMouseDown.current = true
    }

    const handleMouseUp = () => {
      isRootMouseDown.current = false
    }

    const handleChange = () => {
      setContentChanged(editor.children)
    }
    root.addEventListener('mousedown', handleMouseDown)
    root.addEventListener('mouseup', handleMouseUp)
    rootRef.current = root

    const handleSelectOpen = () => {
      handleOpen()
    }

    const handleTouchHoldOpen = () => {
      handleOpen(true)
    }

    const handleTouchTrack = () => {
      setOpen(value => {
        const newValue = !value
        if (newValue) {
          handleOpen(true)
        }
        return newValue
      })
    }

    document.body.appendChild(root)
    editor.on('blur', handleSelectStart)
    editor.on('touchhold', handleTouchHoldOpen)
    editor.on('touchtrack', handleTouchTrack)
    editor.on('selectstart', handleSelectStart)
    editor.on('selectend', handleSelectOpen)
    editor.on('selectionchange', handleSelectionChange)
    editor.on('change', handleChange)
    return () => {
      document.body.removeChild(root)
      editor.off('blur', handleSelectStart)
      editor.off('touchhold', handleTouchHoldOpen)
      editor.off('touchtrack', handleTouchTrack)
      editor.off('selectstart', handleSelectStart)
      editor.off('selectend', handleSelectOpen)
      editor.off('selectionchange', handleSelectionChange)
      editor.off('change', handleChange)
      root.removeEventListener('mousedown', handleMouseDown)
      root.removeEventListener('mouseup', handleMouseUp)
    }
  }, [editor, handleOpen, handleSelectStart, handleSelectionChange])

  const [active] = useSlotActive(InlineToolbar)
  useIsomorphicLayoutEffect(() => {
    if (active === false) {
      setOpen(false)
    }
  }, [active])

  useIsomorphicLayoutEffect(() => {
    if (open) Slot.update(editor, { active: true }, c => c === InlineToolbar)
  }, [editor, open])

  const locale = useLocale<InlineToolbarLocale>('inlineToolbar')

  return Popover({
    open: items.length > 0 && containerRef.current && rootRef.current ? open : false,
    onOpenChange: setOpen,
    children: [
      PopoverAnchor({
        virtualRef,
        dispatchRefreshCustomEvent: 'refreshInlineToolbarPosition',
      }),
      PopoverPortal({
        container: rootRef.current,
        children: PopoverContent({
          side,
          sideOffset: 10,
          children: Toolbar({
            items,
            mode: 'inline',
            locale,
          }),
        }),
      }),
    ]
  })
}
