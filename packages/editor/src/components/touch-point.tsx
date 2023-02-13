import * as React from 'react'
import { Range } from '@editablejs/models'
import { useEditableStatic } from '../hooks/use-editable'
import { useFocused } from '../hooks/use-focused'
import {
  useSelectionDrawingSelection,
  useSelectionDrawingRects,
  useSelectionDrawingEnabled,
  useSelectionDrawingStyle,
} from '../hooks/use-selection-drawing'
import { isTouchDevice } from '../utils/environment'
import { IS_TOUCHING, IS_TOUCHMOVING, IS_TOUCH_HOLD } from '../utils/weak-maps'
import { ShadowBlock } from './shadow'

interface TouchPointProps {
  onAnchorTouchStart?: (e: React.TouchEvent) => void
  onFocusTouchStart?: (e: React.TouchEvent) => void
}

const TouchPointComponent: React.FC<TouchPointProps> = React.memo(
  ({ onAnchorTouchStart, onFocusTouchStart }) => {
    const selection = useSelectionDrawingSelection()
    const rects = useSelectionDrawingRects()
    const enabled = useSelectionDrawingEnabled()
    const style = useSelectionDrawingStyle()
    const editor = useEditableStatic()

    if (
      rects.length === 0 ||
      !isTouchDevice ||
      !enabled ||
      !selection ||
      IS_TOUCHING.get(editor) ||
      (!IS_TOUCHMOVING.get(editor) && Range.isCollapsed(selection))
    )
      return null
    const anchor = rects[0]
    const focus = rects[rects.length - 1]

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: 12,
      height: 12,
      borderRadius: '100%',
      overscrollBehavior: 'none',
      background: style.dragColor,
    }

    return (
      <>
        <ShadowBlock
          rect={Object.assign({}, anchor.toJSON(), {
            color: style.dragColor,
            width: 2,
            left: anchor.left - 1,
          })}
          style={{
            zIndex: 2,
          }}
        >
          <div
            onTouchStart={onAnchorTouchStart}
            style={{
              ...baseStyle,
              top: -10,
              left: -5,
            }}
          />
        </ShadowBlock>
        <ShadowBlock
          rect={Object.assign({}, focus.toJSON(), {
            color: style.dragColor,
            width: 2,
            left: focus.right - 1,
          })}
          style={{
            zIndex: 2,
          }}
        >
          <div
            onTouchStart={onFocusTouchStart}
            style={{
              ...baseStyle,
              bottom: -10,
              right: -5,
            }}
          />
        </ShadowBlock>
      </>
    )
  },
)
TouchPointComponent.displayName = 'TouchPointComponent'
export { TouchPointComponent }
