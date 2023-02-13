import * as React from 'react'
import { Range } from '@editablejs/models'
import { useEditableStatic } from '../hooks/use-editable'
import { useFocused } from '../hooks/use-focused'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { IS_MOUSEDOWN } from '../utils/weak-maps'
import {
  useSelectionDrawingEnabled,
  useSelectionDrawingRects,
  useSelectionDrawingSelection,
  useSelectionDrawingStyle,
} from '../hooks/use-selection-drawing'
import { isTouchDevice } from '../utils/environment'
import { useReadOnly } from '../hooks/use-read-only'
import { ShadowBlock } from './shadow'

interface CaretProps {
  timeout?: number | false
}

const CaretComponent: React.FC<CaretProps> = React.memo(({ timeout = 530 }) => {
  const editor = useEditableStatic()

  const [focused] = useFocused()

  const timer = React.useRef<number>()

  const ref = React.useRef<HTMLDivElement>(null)

  const [readOnly] = useReadOnly()

  const enabled = useSelectionDrawingEnabled()
  const selection = useSelectionDrawingSelection()
  const rects = useSelectionDrawingRects()
  const style = useSelectionDrawingStyle()

  const caretWidth = isTouchDevice ? style.touchWidth : style.caretWidth
  const caretColor = isTouchDevice ? style.touchColor : style.caretColor

  const rect = React.useMemo(() => {
    if (!selection || rects.length === 0 || !focused || !Range.isCollapsed(selection)) return null
    return rects[0].toJSON()
  }, [focused, rects, selection])

  const clearActive = React.useCallback(() => {
    clearTimeout(timer.current)
  }, [])

  const setOpacity = (opacity?: number) => {
    const elRef = ref.current
    if (elRef) {
      elRef.style.opacity =
        opacity !== undefined ? String(opacity) : elRef.style.opacity === '1' ? '0' : '1'
    }
  }

  const active = React.useCallback(
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
    if (readOnly) {
      clearActive()
    } else active(1)
    return () => clearActive()
  }, [editor, readOnly, active, clearActive])

  if (!enabled || readOnly) return null

  return (
    <ShadowBlock
      rect={
        rect
          ? Object.assign({}, rect, { width: caretWidth, color: caretColor })
          : { width: 0, height: 0, top: 0, left: 0 }
      }
      ref={ref}
      style={{ willChange: 'opacity, transform', opacity: rect ? 1 : 0 }}
    />
  )
})
CaretComponent.displayName = 'CaretComponent'
export { CaretComponent }
