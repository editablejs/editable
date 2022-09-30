import { FC, ReactNode, useRef, useState } from 'react'
import { DismissableLayer } from './dismissable-layer'
import { Anchor, Arrow, Content, Popper } from './popper'
import { Portal } from './portal'
import { Presence } from './presence'

interface TooltipProps {
  content: ReactNode
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
}

export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  mouseEnterDelay = 0,
  mouseLeaveDelay = 0.1,
}) => {
  const [open, setOpen] = useState(false)
  const delayTimer = useRef<number | null>(null)

  const clearDelayTimer = () => {
    if (delayTimer.current) {
      clearTimeout(delayTimer.current)
      delayTimer.current = null
    }
  }

  const delaySetOpen = (open: boolean, delayS: number) => {
    const delay = delayS * 1000
    clearDelayTimer()
    if (delay) {
      delayTimer.current = window.setTimeout(() => {
        setOpen(open)
        clearDelayTimer()
      }, delay)
    } else {
      setOpen(open)
    }
  }

  return (
    <Popper>
      <Anchor
        onMouseEnter={() => delaySetOpen(true, mouseEnterDelay)}
        onMouseLeave={() => delaySetOpen(false, mouseLeaveDelay)}
        onMouseDown={event => {
          event.preventDefault()
          delaySetOpen(true, 0)
        }}
      >
        {children}
      </Anchor>
      <Presence present={open}>
        <DismissableLayer onPointerDownOutside={() => setOpen(false)}>
          <Portal>
            <Content
              onMouseEnter={() => delaySetOpen(true, mouseEnterDelay)}
              onMouseLeave={() => delaySetOpen(false, mouseLeaveDelay)}
              tw="text-white bg-black bg-opacity-80 text-center text-sm rounded-sm px-3 py-2 z-50"
            >
              {content}
              <Arrow />
            </Content>
          </Portal>
        </DismissableLayer>
      </Presence>
    </Popper>
  )
}
