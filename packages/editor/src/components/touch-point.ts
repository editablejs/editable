import { Range } from '@editablejs/models'
import { useEditableStatic } from '../hooks/use-editable'
import {
  useSelectionDrawingSelection,
  useSelectionDrawingRects,
  useSelectionDrawingEnabled,
  useSelectionDrawingStyle,
} from '../hooks/use-selection-drawing'
import { isTouchDevice } from '../utils/environment'
import { IS_TOUCHING, IS_TOUCHMOVING } from '../utils/weak-maps'
import { ShadowBlock } from './shadow'
import { CSSProperties, html, virtual } from 'rezon'
import { styleMap } from 'rezon/directives/style-map'

interface TouchPointProps {
  onAnchorTouchStart?: (e: TouchEvent) => void
  onFocusTouchStart?: (e: TouchEvent) => void
}

const TouchPointComponent = virtual<TouchPointProps>(
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

    const baseStyle: CSSProperties = {
      position: 'absolute',
      width: 12,
      height: 12,
      borderRadius: '100%',
      overscrollBehavior: 'none',
      background: style.dragColor,
    }

    return [
      ShadowBlock({
        rect: Object.assign({}, anchor.toJSON(), {
          color: style.dragColor,
          width: 2,
          left: anchor.left - 1,
        }),
        style: {
          zIndex: 2,
        },
        children: html`<div
          @touchstart=${onAnchorTouchStart}
          style=${styleMap({
            ...baseStyle,
            top: -10,
            left: -5,
          })}
        ></div>`,
      }),
      ShadowBlock({
        rect: Object.assign({}, focus.toJSON(), {
          color: style.dragColor,
          width: 2,
          left: focus.right - 1,
        }),
        style: {
          zIndex: 2,
        },
        children: html`<div
          @touchstart=${onFocusTouchStart}
          style=${styleMap({
            ...baseStyle,
            bottom: -10,
            right: -5,
          })}
        ></div>`,
      }),
    ]
  },
)

export { TouchPointComponent }
