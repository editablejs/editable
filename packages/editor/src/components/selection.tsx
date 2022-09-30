import { FC, useState } from 'react'
import { Range, Selection } from 'slate'
import { useEditableStatic } from '../hooks/use-editable-static'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { useDrawSelection } from '../hooks/user-draw-selection'
import { getRectsByRange } from '../utils/selection'
import { ShadowRect } from './shadow'

interface SelectionProps {
  color?: string
}

const SelectionComponent: FC<SelectionProps> = ({ color = 'rgba(0,127,255,0.3)' }) => {
  const { rects, selection } = useDrawSelection()

  return (
    <>
      {selection &&
        Range.isExpanded(selection) &&
        rects.map((rect, index) => {
          return (
            <ShadowRect
              key={`sel-${index}`}
              rect={Object.assign({}, rect.toJSON(), { color })}
              style={{ willChange: 'transform' }}
            />
          )
        })}
    </>
  )
}

export { SelectionComponent }
