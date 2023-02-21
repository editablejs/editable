import {
  Editable,
  useEditableStatic,
  useDragMethods,
  FormatData,
  useDragging,
  SlotComponentProps,
  useLocale,
  useIsomorphicLayoutEffect,
  useReadOnly,
  DATA_EDITABLE_PLACEHOLDER,
  DATA_EDITABLE_STRING,
  DATA_EDITABLE_ZERO_WIDTH,
} from '@editablejs/editor'
import { DOMElement, Editor, GridCell, Transforms } from '@editablejs/models'
import * as React from 'react'
import { Point, Icon, Tooltip } from '@editablejs/ui'
import {
  useSideToolbarMenuOpen,
  SideToolbar as SideToolbarStore,
  useSideToolbarDecorateOpen,
} from '../store'
import { SideToolbarLocale } from '../locale'
import tw from 'twin.macro'
import { ContextMenu } from './context-menu'
import { clearCapturedData, getCapturedData, setCapturedData } from '../weak-map'
import { getOptions } from '../options'

export interface SideToolbar extends SlotComponentProps {}

const StyledTooltipContent = tw.div`text-gray-400 text-xs text-left`

const StyledTooltipContentAction = tw.span`text-white mr-1`

const findFirstElementChild = (el: DOMElement): DOMElement => {
  const child = el.firstElementChild
  if (!child) return el
  if (child.querySelector(`[${DATA_EDITABLE_PLACEHOLDER}]`)) {
    const next = child.nextElementSibling
    if (next) return findFirstElementChild(next)
    return el
  }
  return findFirstElementChild(child)
}

export const SideToolbar: React.FC<SideToolbar> = () => {
  const editor = useEditableStatic()
  const {
    delayDragDuration = 0.2,
    delayHideDuration = 0.2,
    horizontalDistanceThreshold = 30,
    verticalDistanceThreshold = 30,
    match,
  } = React.useMemo(() => {
    return getOptions(editor)
  }, [editor])
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<Point | null>(null)

  const [menuOpen, setMenuOpen] = useSideToolbarMenuOpen(editor)
  // const prevVisibleRef = React.useRef(false)
  const prevEventPositionRef = React.useRef<Point | null>(null)
  const showingRef = React.useRef(false)
  const delayHideTimer = React.useRef<number | null>(null)

  const [readOnly] = useReadOnly()

  const dragging = useDragging()

  const hide = React.useCallback(() => {
    if (dragging) return
    setPosition(null)
    setMenuOpen(false)
    SideToolbarStore.setDecorateOpen(editor, false)
    setTooltipDefaultOpen(false)
    clearCapturedData(editor)
    showingRef.current = false
  }, [editor, dragging, setMenuOpen])

  React.useEffect(() => {
    if (!menuOpen) {
      SideToolbarStore.setDecorateOpen(editor, false)
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
    (delayS: number = delayHideDuration) => {
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
    [clearDelayHideTimer, hide, delayHideDuration],
  )

  const handleUpdatePosition = React.useCallback(
    (event: MouseEvent) => {
      const point = Editable.findEventPoint(editor, event)
      if (!point) return
      let isFindList = false
      const entry = Editor.above(editor, {
        at: point,
        match: n => {
          const customMatch = match?.(n)
          if (customMatch === false) return false
          if (!isFindList && Editor.isList(editor, n)) {
            isFindList = true
            return true
          }
          return isFindList ? false : Editor.isBlock(editor, n)
        },
        mode: 'lowest',
      })
      if (!entry) return delayHide()
      const [node, path] = entry
      const isVoid = editor.isVoid(node)
      const element = Editable.toDOMNode(editor, node)
      // 优先对齐文本节点
      const textElement = isFindList
        ? findFirstElementChild(element)
        : element.querySelector(`[${DATA_EDITABLE_STRING}],[${DATA_EDITABLE_ZERO_WIDTH}]`)
      const rects = (!isVoid && textElement ? textElement : element).getClientRects()

      if (!rects.length) return delayHide()
      const rect = Array.from(rects).find(rect => rect.height > 0) ?? rects[0]
      let { x, y, height } = rect
      const gridCell = GridCell.find(editor, point)
      if (gridCell) {
        const cellElement = Editable.toDOMNode(editor, gridCell[0])
        const cellRect = cellElement.getBoundingClientRect()
        x = cellRect.x
      }

      const [left, top] = Editable.toRelativePosition(editor, x, isVoid ? y : y + height / 2)
      clearDelayHideTimer()
      setCapturedData(editor, {
        selection: Editor.range(editor, path),
        element: node,
        path,
        isEmpty: Editor.isEmpty(editor, node),
        isVoid,
      })
      setPosition({
        x: left,
        y: top,
      })
    },
    [clearDelayHideTimer, delayHide, editor],
  )

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (dragging || menuOpen) return

      const { clientX, clientY } = event

      const data = getCapturedData(editor)
      // 介于按钮和节点区域之间不处理
      if (containerRef.current && data) {
        const { x, y, bottom } = Editable.toDOMNode(editor, data.element).getBoundingClientRect()
        const currentRect = containerRef.current.getBoundingClientRect()
        const { x: cX } = currentRect
        if (clientX >= cX && clientX <= x && clientY >= y && clientY <= bottom) {
          return
        }
      }
      // 编辑器的容错范围外直接隐藏
      const container = Editable.toDOMNode(editor, editor)
      const { x, y, width, height } = container.getBoundingClientRect()
      if (
        clientX < x - horizontalDistanceThreshold ||
        clientX > x + width + horizontalDistanceThreshold ||
        clientY < y - verticalDistanceThreshold ||
        clientY > y + height + verticalDistanceThreshold
      ) {
        return delayHide()
      }

      const { x: pX, y: pY } = prevEventPositionRef.current ?? { x: 0, y: 0 }

      if (Math.abs(pX - clientX) <= 3 && Math.abs(pY - clientY) <= 3) return

      prevEventPositionRef.current = {
        x: clientX,
        y: clientY,
      }

      handleUpdatePosition(event)
    },
    [
      dragging,
      menuOpen,
      handleUpdatePosition,
      delayHide,
      horizontalDistanceThreshold,
      verticalDistanceThreshold,
    ],
  )

  const handleMoseLeave = React.useCallback(() => {
    clearDelayHideTimer()
    if (!showingRef.current) delayHide()
  }, [clearDelayHideTimer, delayHide])

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [editor, handleMoseLeave, handleMouseMove])

  const decorateOpen = useSideToolbarDecorateOpen(editor)
  useIsomorphicLayoutEffect(() => {
    const data = getCapturedData(editor)

    if (decorateOpen && data) {
      const domElement = Editable.toDOMNode(editor, data.element)
      const prevCssText = domElement.style.cssText
      domElement.style.cssText = `
    border-radius: 0.375rem;
    background-color: rgb(239 246 255 / 1);
    ${prevCssText}
    `
      return () => {
        domElement.style.cssText = prevCssText
      }
    }
  }, [editor, decorateOpen])

  const visible = React.useMemo(() => {
    return !!position
  }, [position])

  const actionType = !getCapturedData(editor)?.isEmpty ? 'drag' : 'add'

  const transformPosition = React.useMemo(() => {
    if (!position || !containerRef.current) return
    const { x, y } = position
    const { offsetWidth, clientHeight } = containerRef.current
    const data = getCapturedData(editor)
    return {
      x: x - offsetWidth - 8,
      y: data?.isVoid ? y : y - clientHeight / 2,
    }
  }, [position, editor])

  // const isTransformAmimation = React.useMemo(() => {
  //   const visible = !!position
  //   const isAmimation = visible === prevVisibleRef.current
  //   prevVisibleRef.current = visible
  //   return isAmimation
  // }, [position])

  const { setDrag } = useDragMethods()

  const drag = React.useCallback(() => {
    const data = getCapturedData(editor)
    if (!data || !position) {
      return
    }
    const { path, element } = data
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
  }, [position, setDrag, editor])

  const [tooltipDefaultOpen, setTooltipDefaultOpen] = React.useState(false)
  const delayDragTimer = React.useRef<number | null>(null)

  const clearDelayDragTimer = React.useCallback(() => {
    if (delayDragTimer.current) {
      clearTimeout(delayDragTimer.current)
      delayDragTimer.current = null
    }
  }, [])

  const delayDrag = React.useCallback(
    (delayS: number = delayDragDuration) => {
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
    [clearDelayDragTimer, drag, delayDragDuration],
  )

  const handleMouseDown = () => {
    if (actionType === 'drag') delayDrag()
  }

  const handleMouseUp = () => {
    clearDelayDragTimer()
    setDrag(null)
    setMenuOpen(!menuOpen)
    setTooltipDefaultOpen(true)
  }

  const handleMouseEnter = () => {
    clearDelayHideTimer()
    showingRef.current = true
    const data = getCapturedData(editor)
    SideToolbarStore.setDecorateOpen(editor, !!data)
  }

  const handleMouseLeave = () => {
    if (menuOpen) return
    delayHide()
    showingRef.current = false
    SideToolbarStore.setDecorateOpen(editor, false)
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
    const data = getCapturedData(editor)
    if (data) {
      const { selection } = data
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
        tw="absolute left-0 top-0 z-50 "
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

  if (readOnly) return null

  if (dragging || menuOpen || !visible) return renderBtn()

  return (
    <Tooltip content={renderTooltipContent()} defaultOpen={tooltipDefaultOpen} side="top">
      {renderBtn()}
    </Tooltip>
  )
}
