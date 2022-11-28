import {
  Editable,
  Editor,
  useEditableStatic,
  Constants,
  Element,
  isDOMHTMLElement,
  useDragMethods,
  FormatData,
  Range,
  GridCell,
  useDragging,
  Slot,
  SlotComponentProps,
  Locale,
  useLocale,
} from '@editablejs/editor'
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ContextMenu as UIContextMenu,
  ContextMenuItem as UIContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  Point,
  Icon,
  Tooltip,
} from '@editablejs/plugin-ui'
import { SideToolbarItem, useSideToolbarItems, useSideToolbarMenuOpen } from '../store'
import locales, { SideToolbarLocale } from './locale'
import tw from 'twin.macro'

export interface SideToolbarOptions {}

export const SIDE_TOOLBAR_OPTIONS = new WeakMap<Editable, SideToolbarOptions>()

export interface SideToolbarEditor extends Editable {}

export const SideToolbarEditor = {
  getOptions: (editor: Editable): SideToolbarOptions => {
    return SIDE_TOOLBAR_OPTIONS.get(editor) ?? {}
  },
}

export interface SideToolbar extends SlotComponentProps {
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  mouseDragDelay?: number
}

interface CurrentCapturedData {
  selection: Range
  element: Element
  isEmpty: boolean
}

const StyledTooltipContent = tw.div`text-gray-400 text-xs text-left`

const StyledTooltipContentAction = tw.span`text-white mr-1`

interface ContextMenu extends UIContextMenu {
  onSelect?: (event: React.MouseEvent) => void
  editor: Editable
}

const ContextMenu: FC<ContextMenu> = ({
  editor,
  container,
  onSelect: onContextSelect,
  ...props
}) => {
  const renderItems = (items: SideToolbarItem[]) => {
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
        <UIContextMenuItem
          onSelect={event => {
            if (onSelect) onSelect(event)
            if (onContextSelect) onContextSelect(event)
          }}
          href={href}
          {...rest}
        >
          {title}
        </UIContextMenuItem>
      )
    })
  }

  const items = useSideToolbarItems(editor)

  return (
    <UIContextMenu container={container} {...props}>
      {renderItems(items)}
    </UIContextMenu>
  )
}

const SideToolbar: FC<SideToolbar> = ({
  mouseEnterDelay = 0,
  mouseLeaveDelay = 0.2,
  mouseDragDelay = 0.2,
}) => {
  const editor = useEditableStatic()
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<Point | null>(null)

  const [menuOpen, setMenuOpen] = useSideToolbarMenuOpen(editor)
  const prevVisibleRef = useRef(false)
  const prevEventPositionRef = useRef<Point | null>(null)
  const capturedDataRef = useRef<CurrentCapturedData | null>(null)
  const showingRef = useRef(false)
  const delayHideTimer = useRef<number | null>(null)

  const delayUpdateTimer = useRef<number | null>(null)

  const dragging = useDragging()

  const hide = useCallback(() => {
    if (dragging) return
    setPosition(null)
    setMenuOpen(false)
    setTooltipDefaultOpen(false)
    capturedDataRef.current = null
    showingRef.current = false
  }, [dragging, setMenuOpen])

  useEffect(() => {
    const handleSelectionChange = () => {
      if (menuOpen) {
        hide()
      }
    }
    const handleFocus = () => {
      setMenuOpen(false)
      setTooltipDefaultOpen(false)
    }
    editor.on('focus', handleFocus)
    editor.on('selectionchange', handleSelectionChange)
    return () => {
      editor.off('focus', handleFocus)
      editor.off('selectionchange', handleSelectionChange)
    }
  }, [editor, hide, menuOpen, setMenuOpen])

  useEffect(() => {
    const handleKeydown = () => {
      hide()
    }
    editor.on('keydown', handleKeydown)
    return () => {
      editor.off('keydown', handleKeydown)
    }
  }, [editor, hide])

  const clearDelayHideTimer = useCallback(() => {
    if (delayHideTimer.current) {
      clearTimeout(delayHideTimer.current)
      delayHideTimer.current = null
    }
  }, [])

  const delayHide = useCallback(
    (delayS: number = mouseLeaveDelay) => {
      const delay = delayS * 1000
      clearDelayHideTimer()
      if (delay) {
        delayHideTimer.current = window.setTimeout(() => {
          hide()
          clearDelayHideTimer()
        }, delay)
      } else {
        hide()
      }
    },
    [clearDelayHideTimer, hide, mouseLeaveDelay],
  )

  const update = useCallback(
    (event: MouseEvent) => {
      if (dragging || menuOpen) return

      const { target, clientX, clientY } = event
      const { x: pX, y: pY } = prevEventPositionRef.current ?? { x: 0, y: 0 }
      if (Math.abs(pX - clientX) <= 3 && Math.abs(pY - clientY) <= 3) return
      if (
        target instanceof HTMLElement &&
        !Object.keys(Constants).some(key => {
          if (!key.startsWith('data')) return false
          const value = Constants[key as keyof typeof Constants]
          return target.hasAttribute(value)
        })
      ) {
        return
      }
      prevEventPositionRef.current = {
        x: clientX,
        y: clientY,
      }
      const point = Editable.findEventPoint(editor, event)
      if (!point) return
      const entry = Editor.above(editor, {
        at: point,
        match: n => Element.isElement(n),
        mode: 'lowest',
      })
      if (!entry) return delayHide()
      const element = Editable.toDOMNode(editor, entry[0])
      const rect = isDOMHTMLElement(element.firstChild)
        ? element.firstChild.getBoundingClientRect()
        : element.getBoundingClientRect()
      let { x, y } = rect

      const gridCell = GridCell.find(editor, point)
      if (gridCell) {
        const cellElement = Editable.toDOMNode(editor, gridCell[0])
        const cellRect = cellElement.getBoundingClientRect()
        x = cellRect.x
      }
      const [left, top] = Editable.toRelativePosition(editor, x, y)
      clearDelayHideTimer()
      capturedDataRef.current = {
        selection: {
          anchor: Editable.toLowestPoint(editor, entry[1]),
          focus: Editable.toLowestPoint(editor, entry[1], 'end'),
        },
        element: entry[0],
        isEmpty: Editable.isEmpty(editor, entry[0]),
      }
      setPosition({
        x: left,
        y: top,
      })
    },
    [clearDelayHideTimer, delayHide, dragging, editor, menuOpen],
  )

  const clearDelayUpdateTimer = useCallback(() => {
    if (delayUpdateTimer.current) {
      clearTimeout(delayUpdateTimer.current)
      delayUpdateTimer.current = null
    }
  }, [])

  const clearDelay = useCallback(() => {
    clearDelayHideTimer()
    clearDelayUpdateTimer()
  }, [clearDelayHideTimer, clearDelayUpdateTimer])

  const delayUpdate = useCallback(
    (event: MouseEvent, delayS: number = mouseEnterDelay) => {
      const delay = delayS * 1000

      clearDelay()
      if (delay) {
        delayUpdateTimer.current = window.setTimeout(() => {
          update(event)
          clearDelayUpdateTimer()
        }, delay)
      } else {
        update(event)
      }
    },
    [clearDelay, clearDelayUpdateTimer, mouseEnterDelay, update],
  )

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      delayUpdate(event)
    },
    [delayUpdate],
  )

  const handleMoseLeave = useCallback(() => {
    clearDelay()
    if (!showingRef.current) delayHide()
  }, [clearDelay, delayHide])

  useEffect(() => {
    const container = Editable.toDOMNode(editor, editor)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMoseLeave)
    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMoseLeave)
    }
  }, [editor, handleMoseLeave, handleMouseMove])

  const visible = useMemo(() => {
    return !!position
  }, [position])

  const actionType = !capturedDataRef.current?.isEmpty ? 'drag' : 'add'

  const transform = useMemo(() => {
    if (!position || !containerRef.current) return
    const { x, y } = position
    const { offsetWidth } = containerRef.current
    return `translate3d(${x - offsetWidth - 4}px, ${y}px, 0)`
  }, [position])

  const isTransformAmimation = useMemo(() => {
    const visible = !!position
    const isAmimation = visible === prevVisibleRef.current
    prevVisibleRef.current = visible
    return isAmimation
  }, [position])

  const { setDrag } = useDragMethods()

  const drag = useCallback(() => {
    if (!capturedDataRef.current || !position) {
      return
    }
    const { selection, element } = capturedDataRef.current
    const dataTransfer = new DataTransfer()
    FormatData.setDataTransfer(dataTransfer, {
      fragment: [element],
    })
    setDrag({
      type: 'block',
      from: selection,
      data: dataTransfer,
      position,
    })
  }, [position, setDrag])

  const [tooltipDefaultOpen, setTooltipDefaultOpen] = useState(false)
  const delayDragTimer = useRef<number | null>(null)

  const clearDelayDragTimer = useCallback(() => {
    if (delayDragTimer.current) {
      clearTimeout(delayDragTimer.current)
      delayDragTimer.current = null
    }
  }, [])

  const delayDrag = useCallback(
    (delayS: number = mouseDragDelay) => {
      const delay = delayS * 1000
      clearDelayDragTimer()
      if (delay) {
        delayDragTimer.current = window.setTimeout(() => {
          drag()
          clearDelayDragTimer()
        }, delay)
      } else {
        drag()
      }
    },
    [clearDelayDragTimer, drag, mouseDragDelay],
  )

  const handleMouseDown = () => {
    if (actionType === 'drag') delayDrag()
  }

  const handleMouseUp = () => {
    clearDelayDragTimer()
    setDrag(null)
    setMenuOpen(!menuOpen, {
      range: capturedDataRef.current?.selection,
      element: capturedDataRef.current?.element,
    })
    setTooltipDefaultOpen(true)
  }

  const handleMouseEnter = () => {
    clearDelay()
    showingRef.current = true
  }

  const handleMouseLeave = () => {
    delayHide()
    showingRef.current = false
  }

  const local = useLocale<SideToolbarLocale>('sideToolbar')

  const renderTooltipContent = () => {
    const contents = [
      <div key="action-open-menu">
        <StyledTooltipContentAction>{local.actionClick}</StyledTooltipContentAction>
        {local.openMenu}
      </div>,
    ]
    if (actionType === 'drag')
      contents.push(
        <div key="action-drag">
          <StyledTooltipContentAction>{local.actionDrag}</StyledTooltipContentAction>
          {local.dragDrop}
        </div>,
      )
    return <StyledTooltipContent>{contents}</StyledTooltipContent>
  }

  const renderMenu = () => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    return (
      <div
        tw="absolute top-0"
        style={{
          right: `${(containerRef.current.offsetWidth ?? 0) + 2}px`,
        }}
      >
        <ContextMenu
          editor={editor}
          open={true}
          onSelect={() => hide()}
          side="left"
          container={{
            x: rect.left,
            y: rect.top,
          }}
        />
      </div>
    )
  }

  const renderBtn = () => {
    return (
      <div
        ref={containerRef}
        tw="absolute left-0 top-0 z-50 "
        style={{
          opacity: visible ? 1 : 0,
          visibility: visible ? 'visible' : 'hidden',
          transform,
          willChange: 'transform',
          transition: isTransformAmimation ? 'all 0.2s linear 0s' : 'opacity 0.2s linear 0s',
          cursor: dragging ? 'grabbing' : 'grab',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          tw="flex items-center justify-center rounded-full bg-white border border-solid border-gray-300 shadow-sm text-xs text-gray-600 p-1 cursor-grab hover:bg-gray-100"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onDragStart={e => e.preventDefault()}
        >
          <Icon name={actionType === 'drag' ? 'menu' : 'plus'} />
        </div>
        {menuOpen && renderMenu()}
      </div>
    )
  }

  if (dragging || menuOpen || !visible) return renderBtn()

  return (
    <Tooltip
      content={renderTooltipContent()}
      mouseLeaveDelay={0}
      mouseEnterDelay={0}
      mouseEnterStay={false}
      defaultOpen={tooltipDefaultOpen}
      side="top"
    >
      {renderBtn()}
    </Tooltip>
  )
}

export const withSideToolbar = <T extends Editable>(
  editor: T,
  options: SideToolbarOptions = {},
) => {
  const newEditor = editor as T & SideToolbarEditor

  SIDE_TOOLBAR_OPTIONS.set(newEditor, options)

  for (const key in locales) {
    Locale.setLocale(newEditor, key, locales[key])
  }

  Slot.mount(editor, SideToolbar)

  newEditor.on('destory', () => {
    Slot.unmount(editor, SideToolbar)
  })

  return newEditor
}
