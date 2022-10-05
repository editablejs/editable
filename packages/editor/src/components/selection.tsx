import { FC } from 'react'
import { Range } from 'slate'
import { useDrawSelection } from '../hooks/use-draw-selection'
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
