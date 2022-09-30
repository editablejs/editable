import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { Selection, Range } from 'slate'
import { useEditable } from '../hooks/use-editable'
import { useEditableStatic } from '../hooks/use-editable-static'
import { useFocused } from '../hooks/use-focused'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { useDrawSelection } from '../hooks/user-draw-selection'
import { getRectsByRange } from '../utils/selection'
import { IS_MOUSEDOWN } from '../utils/weak-maps'
import { ShadowRect } from './shadow'

interface CaretProps {
  width?: number
  color?: string
  timeout?: number | false
}

const CaretComponent: FC<CaretProps> = ({ width = 1, color = '#000', timeout = 530 }) => {
  const editor = useEditableStatic()

  const [focused] = useFocused()

  const timer = useRef<number>()

  const ref = useRef<HTMLDivElement>(null)

  const { selection, rects } = useDrawSelection()

  const rect = useMemo(() => {
    if (!selection || rects.length === 0 || !focused || !Range.isCollapsed(selection)) return null
    return rects[0].toJSON()
  }, [focused, rects, selection])

  const clearActive = useCallback(() => {
    clearTimeout(timer.current)
  }, [])

  const setOpacity = (opacity?: number) => {
    const elRef = ref.current
    if (elRef) {
      elRef.style.opacity =
        opacity !== undefined ? String(opacity) : elRef.style.opacity === '1' ? '0' : '1'
    }
  }

  const active = useCallback(
    (opacity?: number) => {
      clearActive()
      if (!rect || timeout === false) return
      if (IS_MOUSEDOWN.get(editor)) {
        setOpacity(1)
      } else {
        setOpacity(opacity)
      }
      timer.current = setTimeout(() => {
        active()
      }, timeout)
    },
    [clearActive, editor, rect, timeout],
  )

  useIsomorphicLayoutEffect(() => {
    active(1)
    return () => clearActive()
  }, [editor, active, clearActive])

  return (
    <ShadowRect
      rect={
        rect ? Object.assign({}, rect, { width, color }) : { width: 0, height: 0, top: 0, left: 0 }
      }
      ref={ref}
      style={{ willChange: 'opacity, transform', opacity: rect ? 1 : 0 }}
    />
  )
}

export { CaretComponent }
