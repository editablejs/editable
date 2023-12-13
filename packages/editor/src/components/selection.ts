import { Range } from '@editablejs/models'
import { useFocused } from '../hooks/use-focused'
import {
  useSelectionDrawingSelection,
  useSelectionDrawingRects,
  useSelectionDrawingEnabled,
  useSelectionDrawingStyle,
} from '../hooks/use-selection-drawing'
import { ShadowBlock } from './shadow'
import { isTouchDevice } from '../utils/environment'
import { virtual } from 'rezon'
import { repeat } from 'rezon/directives/repeat'

interface SelectionProps {}

const SelectionComponent = virtual<SelectionProps>(() => {
  const selection = useSelectionDrawingSelection()
  const rects = useSelectionDrawingRects()
  const enabled = useSelectionDrawingEnabled()
  const style = useSelectionDrawingStyle()
  const [focused] = useFocused()
  if (!enabled || !selection || Range.isCollapsed(selection)) return null

  return repeat(
    rects,
    (_, index) => index,
    rect =>
      ShadowBlock({
        rect: Object.assign({}, rect.toJSON(), {
          color: isTouchDevice || focused ? style.focusColor : style.blurColor,
        }),
      }),
  )
})

export { SelectionComponent }
