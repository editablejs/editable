import * as React from 'react'

import { cancellablePromise, useCancellablePromises } from './use-cancellable-promises'

const useMultipleClick = (options: {
  onClick?: (event: React.MouseEvent) => void
  onMultipleClick: (event: React.MouseEvent, count: number) => boolean | void
}) => {
  const { onClick, onMultipleClick } = options
  const api = useCancellablePromises()
  const pointRef = React.useRef<{ x: number; y: number }>()
  const countRef = React.useRef(0)

  const isSamePoint = (event: React.MouseEvent | MouseEvent | Touch) => {
    const point = pointRef.current
    return point
      ? Math.abs(event.clientY - point.y) < 10 && Math.abs(event.clientX - point.x) < 10
      : false
  }

  const clear = () => {
    api.clearPendingPromises()
    pointRef.current = undefined
  }

  const handleMultipleClick = (event: React.MouseEvent) => {
    if (event.button === 2) return
    const point = pointRef.current
    if (point) {
      if (isSamePoint(event)) {
        api.clearPendingPromises()
        countRef.current += 1
        if (onMultipleClick(event, countRef.current) === false) {
          clear()
          return
        }
      } else {
        clear()
      }
    } else {
      countRef.current = 1
      pointRef.current = {
        x: event.clientX,
        y: event.clientY,
      }
    }
    if (countRef.current === 1 && onMultipleClick(event, 1) === false) {
      clear()
    } else {
      const waitForClick = cancellablePromise(api.delay(500))
      api.appendPendingPromise(waitForClick)
      return waitForClick.promise
        .then(() => {
          api.removePendingPromise(waitForClick)
          if (onClick) onClick(event)
          pointRef.current = undefined
        })
        .catch(errorInfo => {
          api.removePendingPromise(waitForClick)
          if (!errorInfo.isCanceled) {
            throw errorInfo.error
          }
        })
    }
  }

  return { handleMultipleClick, isSamePoint }
}

export { useMultipleClick }
