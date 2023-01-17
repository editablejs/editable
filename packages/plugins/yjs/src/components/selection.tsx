import { Editable, useEditableStatic } from '@editablejs/editor'
import React from 'react'
import {
  CursorOverlayState,
  useRemoteCursorOverlayPositions,
} from '../hooks/use-remote-cursor-overlay-positions'
import { CursorData } from '../types'
import { Caret } from './caret'

const RemoteSelection = <T extends CursorData = CursorData>({
  data,
  selectionRects,
  caretPosition,
}: CursorOverlayState<T>) => {
  if (!data) {
    return null
  }

  const selectionStyle: React.CSSProperties = {
    // Add a opacity to the background color
    backgroundColor: `${data.color}66`,
  }

  return (
    <React.Fragment>
      {selectionRects.map(({ left, top, height, width }, i) => (
        <div
          style={{ ...selectionStyle, left, top, width, height }}
          tw="pointer-events-none absolute z-10"
          // eslint-disable-next-line react/no-array-index-key
          key={i}
        />
      ))}
      {caretPosition && <Caret position={caretPosition} data={data} />}
    </React.Fragment>
  )
}

export const RemoteCursors = () => {
  const containerRef = React.useRef<HTMLElement | null>(null)
  const editor = useEditableStatic()
  React.useEffect(() => {
    containerRef.current = Editable.toDOMNode(editor, editor)
  }, [editor])

  const { cursors } = useRemoteCursorOverlayPositions<CursorData>({
    containerRef,
  })

  return (
    <>
      {cursors.map(cursor => (
        <RemoteSelection key={cursor.clientId} {...cursor} />
      ))}
    </>
  )
}
