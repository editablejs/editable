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

import { Point, Icon, Tooltip } from '@editablejs/theme'
import {
  useSideToolbarMenuOpen,
  SideToolbar as SideToolbarStore,
  useSideToolbarDecorateOpen,
} from '../store'
import { SideToolbarLocale } from '../locale'
import tw, { css } from 'twin.macro'
import { ContextMenu } from './context-menu'
import { clearCapturedData, getCapturedData, setCapturedData } from '../weak-map'
import { getOptions } from '../options'
import { c, html, useCallback, useEffect, useMemo, useRef, useState } from 'rezon'
import { styleMap } from 'rezon/directives/style-map'
import { ref } from 'rezon/directives/ref'

export interface SideToolbar extends SlotComponentProps { }

const tooltipContentClassName = css(tw`text-gray-400 text-xs text-left`)
const tooltipContentActionClassName = css(tw`text-white mr-1`)

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

export const SideToolbar = c<SideToolbar>(() => {
  const editor = useEditableStatic()
  const {
    delayDragDuration = 0.2,
    delayHideDuration = 0.2,
    horizontalDistanceThreshold = 30,
    verticalDistanceThreshold = 30,
    match,
  } = useMemo(() => {
    return getOptions(editor)
  }, [editor])
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<Point | null>(null)

  const [menuOpen, setMenuOpen] = useSideToolbarMenuOpen(editor)
  // const prevVisibleRef = useRef(false)
  const prevEventPositionRef = useRef<Point | null>(null)
  const showingRef = useRef(false)
  const delayHideTimer = useRef<number | null>(null)

  const [readOnly] = useReadOnly()

  const dragging = useDragging()

  const hide = useCallback(() => {
    if (dragging) return
    setPosition(null)
    setMenuOpen(false)
    SideToolbarStore.setDecorateOpen(editor, false)
    setTooltipDefaultOpen(false)
    clearCapturedData(editor)
    showingRef.current = false
  }, [editor, dragging, setMenuOpen])

  useEffect(() => {
    if (!menuOpen) {
      SideToolbarStore.setDecorateOpen(editor, false)
    }
  }, [editor, menuOpen])

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
    const handleKeyup = () => {
      hide()
    }
    editor.on('keyup', handleKeyup)
    return () => {
      editor.off('keyup', handleKeyup)
    }
  }, [editor, hide])

  const clearDelayHideTimer = useCallback(() => {
    if (delayHideTimer.current) {
      clearTimeout(delayHideTimer.current)
      delayHideTimer.current = null
    }
  }, [])

  const delayHide = useCallback(
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

  const handleUpdatePosition = useCallback(
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

  const handleMouseMove = useCallback(
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

  const handleMoseLeave = useCallback(() => {
    clearDelayHideTimer()
    if (!showingRef.current) delayHide()
  }, [clearDelayHideTimer, delayHide])

  useEffect(() => {
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

  const visible = useMemo(() => {
    return !!position
  }, [position])

  const actionType = !getCapturedData(editor)?.isEmpty ? 'drag' : 'add'

  const transformPosition = useMemo(() => {
    if (!position || !containerRef.current) return
    const { x, y } = position
    const { offsetWidth, clientHeight } = containerRef.current
    const data = getCapturedData(editor)
    return {
      x: x - offsetWidth - 8,
      y: data?.isVoid ? y : y - clientHeight / 2,
    }
  }, [position, editor])

  // const isTransformAmimation = useMemo(() => {
  //   const visible = !!position
  //   const isAmimation = visible === prevVisibleRef.current
  //   prevVisibleRef.current = visible
  //   return isAmimation
  // }, [position])

  const { setDrag } = useDragMethods()

  const drag = useCallback(() => {
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

  const [tooltipDefaultOpen, setTooltipDefaultOpen] = useState(false)
  const delayDragTimer = useRef<number | null>(null)

  const clearDelayDragTimer = useCallback(() => {
    if (delayDragTimer.current) {
      clearTimeout(delayDragTimer.current)
      delayDragTimer.current = null
    }
  }, [])

  const delayDrag = useCallback(
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
    const contents = [html`<div><span class="${tooltipContentActionClassName}">${local.actionClick}${local.openMenu}</span></div>`
    ]
    if (actionType === 'drag')
      contents.push(html`<div><span class="${tooltipContentActionClassName}">${local.actionDrag}</span>${local.dragDrop}</div>`)

    return html`<div class="${tooltipContentClassName}">${contents}</div>`
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
    return html`<div class="${css(tw`absolute top-0`)}" style=${styleMap({
      right: `${(containerRef.current.offsetWidth ?? 0) + 2}px`,
    })}>${ContextMenu({
      editor,
      open: true,
      onSelect: handleMenuSelect,
      side: 'left',
      container: {
        x: rect.left,
        y: rect.top,
      },
      minWidth: 160,
    })
      }</div>`
  }

  const renderBtn = () => {
    return html`<div ref=${ref(containerRef)} class="${css(tw`absolute left-0 top-0 z-50`)}"
    style=${styleMap({
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      left: transformPosition?.x,
      top: transformPosition?.y,
      // transition: isTransformAmimation ? 'all 0.2s linear 0s' : 'opacity 0.2s linear 0s',
      cursor: dragging ? 'grabbing' : 'grab',
    })}
    @mouseenter=${handleMouseEnter}
    @mouseleave=${handleMouseLeave}
    >
      <div class="${css(tw`flex items-center justify-center rounded-full bg-white border border-solid border-gray-300 shadow-sm text-xs text-gray-600 p-1 cursor-grab hover:bg-gray-100`)}"
      @mousedown=${handleMouseDown}
      @mouseup=${handleMouseUp}
      @dragstart=${(e: MouseEvent) => e.preventDefault()}
      >
        ${Icon({ name: actionType === 'drag' ? 'menu' : 'plus' })}
      </div>
      ${menuOpen ? renderMenu() : null}
    </div>`
  }

  if (readOnly) return null

  if (dragging || menuOpen || !visible) return renderBtn()

  return Tooltip({
    content: renderTooltipContent(),
    defaultOpen: tooltipDefaultOpen,
    side: 'top',
    children: renderBtn(),
  })
})
