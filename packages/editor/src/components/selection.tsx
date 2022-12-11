import * as React from 'react'
import { Range } from 'slate'
import { useFocused } from '../hooks/use-focused'
import {
  useSelectionDrawingSelection,
  useSelectionDrawingRects,
  useSelectionDrawingEnabled,
  useSelectionDrawingStyle,
} from '../hooks/use-selection-drawing'
import { ShadowRect } from './shadow'

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
          <ShadowRect
            key={`sel-${index}`}
            rect={Object.assign({}, rect.toJSON(), {
              color: focused ? style.focusColor : style.blurColor,
            })}
          />
        )
      })}
    </>
  )
}

export { SelectionComponent }
