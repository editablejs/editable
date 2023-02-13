import * as React from 'react'
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

interface SelectionProps {}

const SelectionComponent: React.FC<SelectionProps> = () => {
  const selection = useSelectionDrawingSelection()
  const rects = useSelectionDrawingRects()
  const enabled = useSelectionDrawingEnabled()
  const style = useSelectionDrawingStyle()
  const [focused] = useFocused()
  if (!enabled || !selection || Range.isCollapsed(selection)) return null

  return (
    <>
      {rects.map((rect, index) => {
        return (
          <ShadowBlock
            key={`sel-${index}`}
            rect={Object.assign({}, rect.toJSON(), {
              color: isTouchDevice || focused ? style.focusColor : style.blurColor,
            })}
          />
        )
      })}
    </>
  )
}

export { SelectionComponent }
