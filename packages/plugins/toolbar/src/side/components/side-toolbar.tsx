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
  SlotComponentProps,
  useLocale,
  Decorate,
  Transforms,
  Path,
} from '@editablejs/editor'
import * as React from 'react'
import { Point, Icon, Tooltip } from '@editablejs/ui'
import { useSideToolbarMenuOpen } from '../store'
import { SideToolbarLocale } from '../locale'
import tw from 'twin.macro'
import { ContextMenu } from './context-menu'

export interface SideToolbar extends SlotComponentProps {
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  mouseDragDelay?: number
}

interface CurrentCapturedData {
  selection: Range
  path: Path
  element: Element
  isEmpty: boolean
}

const StyledTooltipContent = tw.div`text-gray-400 text-xs text-left`

const StyledTooltipContentAction = tw.span`text-white mr-1`

const StyledElementDecorator = tw.div`rounded-md bg-blue-50 relative -mx-1 px-1`

export const SideToolbar: React.FC<SideToolbar> = ({
  mouseEnterDelay = 0,
  mouseLeaveDelay = 0.2,
  mouseDragDelay = 0.2,
}) => {
  const editor = useEditableStatic()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<Point | null>(null)

  const [menuOpen, setMenuOpen] = useSideToolbarMenuOpen(editor)
  // const prevVisibleRef = React.useRef(false)
  const prevEventPositionRef = React.useRef<Point | null>(null)
  const capturedDataRef = React.useRef<CurrentCapturedData | null>(null)
  const showingRef = React.useRef(false)
  const delayHideTimer = React.useRef<number | null>(null)

  const delayUpdateTimer = React.useRef<number | null>(null)

  const dragging = useDragging()

  const hide = React.useCallback(() => {
    if (dragging) return
    setPosition(null)
    setMenuOpen(false)
    Decorate.remove(editor, 'sideToolbarDecorate')
    setTooltipDefaultOpen(false)
    capturedDataRef.current = null
    showingRef.current = false
  }, [editor, dragging, setMenuOpen])

  React.useEffect(() => {
    if (!menuOpen) {
      Decorate.remove(editor, 'sideToolbarDecorate')
    }
  }, [editor, menuOpen])

  React.useEffect(() => {
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

  React.useEffect(() => {
    const handleKeyup = () => {
      hide()
    }
    editor.on('keyup', handleKeyup)
    return () => {
      editor.off('keyup', handleKeyup)
    }
  }, [editor, hide])

  const clearDelayHideTimer = React.useCallback(() => {
    if (delayHideTimer.current) {
      clearTimeout(delayHideTimer.current)
      delayHideTimer.current = null
    }
  }, [])

  const delayHide = React.useCallback(
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

  const update = React.useCallback(
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
      let isFindList = false
      const entry = Editor.above(editor, {
        at: point,
        match: n => {
          if (!isFindList && Editable.isList(editor, n)) {
            isFindList = true
            return true
          }
          return isFindList ? false : Editor.isBlock(editor, n)
        },
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
      const [node, path] = entry

      capturedDataRef.current = {
        selection: Editor.range(editor, path),
        element: node,
        path,
        isEmpty: Editable.isEmpty(editor, node),
      }
      setPosition({
        x: left,
        y: top,
      })
    },
    [clearDelayHideTimer, delayHide, dragging, editor, menuOpen],
  )

  const clearDelayUpdateTimer = React.useCallback(() => {
    if (delayUpdateTimer.current) {
      clearTimeout(delayUpdateTimer.current)
      delayUpdateTimer.current = null
    }
  }, [])

  const clearDelay = React.useCallback(() => {
    clearDelayHideTimer()
    clearDelayUpdateTimer()
  }, [clearDelayHideTimer, clearDelayUpdateTimer])

  const delayUpdate = React.useCallback(
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

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      delayUpdate(event)
    },
    [delayUpdate],
  )

  const handleMoseLeave = React.useCallback(() => {
    clearDelay()
    if (!showingRef.current) delayHide()
  }, [clearDelay, delayHide])

  React.useEffect(() => {
    const container = Editable.toDOMNode(editor, editor)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMoseLeave)
    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMoseLeave)
    }
  }, [editor, handleMoseLeave, handleMouseMove])

  const visible = React.useMemo(() => {
    return !!position
  }, [position])

  const actionType = !capturedDataRef.current?.isEmpty ? 'drag' : 'add'

  const transformPosition = React.useMemo(() => {
    if (!position || !containerRef.current) return
    const { x, y } = position
    const { offsetWidth } = containerRef.current
    return {
      x: x - offsetWidth - 4,
      y,
    }
  }, [position])

  // const isTransformAmimation = React.useMemo(() => {
  //   const visible = !!position
  //   const isAmimation = visible === prevVisibleRef.current
  //   prevVisibleRef.current = visible
  //   return isAmimation
  // }, [position])

  const { setDrag } = useDragMethods()

  const drag = React.useCallback(() => {
    if (!capturedDataRef.current || !position) {
      return
    }
    const { path, element } = capturedDataRef.current
    const dataTransfer = new DataTransfer()
    FormatData.setDataTransfer(dataTransfer, {
      fragment: [element],
    })
    setDrag({
      type: 'block',
      from: path,
      data: dataTransfer,
      position,
    })
  }, [position, setDrag])

  const [tooltipDefaultOpen, setTooltipDefaultOpen] = React.useState(false)
  const delayDragTimer = React.useRef<number | null>(null)

  const clearDelayDragTimer = React.useCallback(() => {
    if (delayDragTimer.current) {
      clearTimeout(delayDragTimer.current)
      delayDragTimer.current = null
    }
  }, [])

  const delayDrag = React.useCallback(
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

  const getDecorate = React.useCallback((): Decorate | null => {
    if (!capturedDataRef.current) return null
    const { selection, element } = capturedDataRef.current
    return {
      key: 'sideToolbarDecorate',
      type: 'element',
      decorate: entry => {
        if (element !== entry[0]) return []
        return [selection]
      },
      render: ({ children }) => {
        return <StyledElementDecorator>{children}</StyledElementDecorator>
      },
    }
  }, [])

  const handleMouseEnter = () => {
    clearDelay()
    showingRef.current = true
    const decorate = getDecorate()
    if (decorate) {
      Decorate.remove(editor, 'sideToolbarDecorate')
      Decorate.add(editor, decorate)
    }
  }

  const handleMouseLeave = () => {
    if (menuOpen) return
    delayHide()
    showingRef.current = false
    Decorate.remove(editor, 'sideToolbarDecorate')
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

  const handleMenuSelect = () => {
    if (capturedDataRef.current) {
      const { selection } = capturedDataRef.current
      Transforms.select(editor, selection)
    }
    hide()
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
          onSelect={handleMenuSelect}
          side="left"
          container={{
            x: rect.left,
            y: rect.top,
          }}
          minWidth={160}
        />
      </div>
    )
  }

  const renderBtn = () => {
    return (
      <div
        ref={containerRef}
        tw="absolute -left-0.5 top-0 z-50 "
        style={{
          opacity: visible ? 1 : 0,
          visibility: visible ? 'visible' : 'hidden',
          left: transformPosition?.x,
          top: transformPosition?.y,
          // transition: isTransformAmimation ? 'all 0.2s linear 0s' : 'opacity 0.2s linear 0s',
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
    <Tooltip content={renderTooltipContent()} defaultOpen={tooltipDefaultOpen} side="top">
      {renderBtn()}
    </Tooltip>
  )
}
