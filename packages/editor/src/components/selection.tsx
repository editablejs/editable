import { FC, useState } from 'react'
import { Range, Selection } from 'slate'
import { useEditableStatic } from '../hooks/use-editable-static'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { getRectsByRange } from '../utils/selection'
import { ShadowRect } from './shadow'

interface SelectionProps {
  selection: Selection
  color?: string
}

const SelectionComponent: FC<SelectionProps> = ({ selection, color = 'rgba(0,127,255,0.3)' }) => {
  const editor = useEditableStatic()

  const [rects, setRects] = useState<ShadowRect[]>([])

  useIsomorphicLayoutEffect(() => {
    if (!selection || Range.isCollapsed(selection)) setRects([])
    else {
      const rects = getRectsByRange(editor, selection).map(r => r.toJSON())
      setRects(rects)
    }
    return
  }, [editor, selection])

  return (
    <>
      {rects.map((rect, index) => {
        return (
          <ShadowRect
            key={`sel-${index}`}
            rect={Object.assign({}, rect, { color })}
            style={{ willChange: 'transform' }}
          />
        )
      })}
    </>
  )
}

export { SelectionComponent }
