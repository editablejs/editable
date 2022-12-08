import * as React from 'react'
import { DismissableLayer } from './dismissable-layer'
import { PopperAnchor, PopperArrow, PopperContent, Popper } from './popper'
import { Portal } from './portal'
import { Presence } from './presence'

const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left'] as const
const ALIGN_OPTIONS = ['start', 'center', 'end'] as const

type Side = typeof SIDE_OPTIONS[number]
type Align = typeof ALIGN_OPTIONS[number]
interface TooltipProps {
  content: React.ReactNode
  side?: Side
  align?: Align
  arrow?: boolean
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  mouseEnterStay?: boolean
  defaultOpen?: boolean
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  side = 'bottom',
  align = 'center',
  arrow = true,
  content,
  mouseEnterDelay = 0,
  mouseLeaveDelay = 0.1,
  mouseEnterStay = false,
  defaultOpen = false,
}) => {
  const [open, setOpen] = React.useState(defaultOpen)
  const delayTimer = React.useRef<number | null>(null)

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
      <PopperAnchor
        onMouseEnter={() => delaySetOpen(true, mouseEnterDelay)}
        onMouseLeave={() => delaySetOpen(false, mouseLeaveDelay)}
        onMouseDown={() => {
          delaySetOpen(true, 0)
        }}
      >
        {children}
      </PopperAnchor>
      <Presence present={open}>
        <DismissableLayer onPointerDownOutside={() => setOpen(false)}>
          <Portal>
            <PopperContent
              side={side}
              align={align}
              onMouseEnter={() =>
                mouseEnterStay
                  ? delaySetOpen(true, mouseEnterDelay)
                  : delaySetOpen(false, mouseLeaveDelay)
              }
              onMouseLeave={() => delaySetOpen(false, mouseLeaveDelay)}
              tw="text-white bg-black bg-opacity-80 text-center text-sm rounded px-3 py-2 z-50"
            >
              {content}
              {arrow && <PopperArrow />}
            </PopperContent>
          </Portal>
        </DismissableLayer>
      </Presence>
    </Popper>
  )
}
