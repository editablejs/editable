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
} from '@editablejs/editor'
import { Icon, Point, Tooltip } from '@editablejs/plugin-ui'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
}

interface CurrentCapturedData {
  selection: Range
  element: Element
}

const SideToolbar: FC<SideToolbar> = ({ mouseEnterDelay = 0, mouseLeaveDelay = 0.1 }) => {
  const editor = useEditableStatic()
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<Point | null>(null)
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
    capturedDataRef.current = null
  }, [dragging])

  const clearHideDelayTimer = useCallback(() => {
    if (delayHideTimer.current) {
      clearTimeout(delayHideTimer.current)
      delayHideTimer.current = null
    }
  }, [])

  const delayHide = useCallback(
    (delayS: number = mouseLeaveDelay) => {
      const delay = delayS * 1000
      clearHideDelayTimer()
      if (delay) {
        delayHideTimer.current = window.setTimeout(() => {
          hide()
          clearHideDelayTimer()
        }, delay)
      } else {
        hide()
      }
    },
    [clearHideDelayTimer, hide, mouseLeaveDelay],
  )

  const update = useCallback(
    (event: MouseEvent) => {
      if (dragging) return

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
      clearHideDelayTimer()
      capturedDataRef.current = {
        selection: {
          anchor: {
            path: entry[1],
            offset: 0,
          },
          focus: {
            path: entry[1],
            offset: 0,
          },
        },
        element: entry[0],
      }
      setPosition({
        x: left,
        y: top,
      })
    },
    [clearHideDelayTimer, delayHide, dragging, editor],
  )

  const clearUpdateDelayTimer = useCallback(() => {
    if (delayUpdateTimer.current) {
      clearTimeout(delayUpdateTimer.current)
      delayUpdateTimer.current = null
    }
  }, [])

  const clearDelay = useCallback(() => {
    clearHideDelayTimer()
    clearUpdateDelayTimer()
  }, [clearHideDelayTimer, clearUpdateDelayTimer])

  const delayUpdate = useCallback(
    (event: MouseEvent, delayS: number = mouseEnterDelay) => {
      const delay = delayS * 1000

      clearDelay()
      if (delay) {
        delayUpdateTimer.current = window.setTimeout(() => {
          update(event)
          clearUpdateDelayTimer()
        }, delay)
      } else {
        update(event)
      }
    },
    [clearDelay, clearUpdateDelayTimer, mouseEnterDelay, update],
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

  const startDrag = () => {
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
  }

  const endDrag = () => {
    setDrag(null)
  }

  const handleMouseEnter = () => {
    clearDelay()
    showingRef.current = true
  }

  const handleMouseLeave = () => {
    delayHide()
    showingRef.current = false
  }

  const tooltip = () => {
    return <div>Drag to move</div>
  }

  return (
    <Tooltip
      content={tooltip()}
      mouseLeaveDelay={0}
      mouseEnterDelay={0}
      mouseEnterStay={false}
      side="top"
    >
      <div
        ref={containerRef}
        tw="absolute left-0 top-0 rounded-full bg-white border border-solid border-gray-300 shadow-sm text-xs text-gray-600 p-1 flex items-center justify-center cursor-grab z-50 hover:bg-gray-100"
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
        onMouseDown={startDrag}
        onMouseUp={endDrag}
        onDragStart={e => e.preventDefault()}
      >
        <Icon name="menu" />
      </div>
    </Tooltip>
  )
}

export const withSideToolbar = <T extends Editable>(
  editor: T,
  options: SideToolbarOptions = {},
) => {
  const newEditor = editor as T & SideToolbarEditor

  SIDE_TOOLBAR_OPTIONS.set(newEditor, options)

  Slot.mount(editor, SideToolbar)

  newEditor.on('destory', () => {
    Slot.unmount(editor, SideToolbar)
  })

  return newEditor
}
