import { useRef } from 'react';

import useCancellablePromises, {
  cancellablePromise,
  delay,
} from './use-cancellable-promises';

const useMultipleClick = (options: {
  onClick?: (event: React.MouseEvent) => void
  onMultipleClick: (event: React.MouseEvent, count: number) => boolean | void
}) => {
  const { onClick, onMultipleClick } = options
  const api = useCancellablePromises();
  const pointRef = useRef<{ x: number; y: number }>();
  const countRef = useRef(0)
  const handleMultipleClick = (event: React.MouseEvent) => {
    if (event.button === 2) return
    const point = pointRef.current;
    if(point) {
      if(Math.abs(event.clientY - point.y) < 10 && Math.abs(event.clientX - point.x) < 10) {
        api.clearPendingPromises();
        countRef.current += 1
        if(onMultipleClick(event, countRef.current) === false) {
          api.clearPendingPromises();
          pointRef.current = undefined
          return
        }
      } else {
        api.clearPendingPromises();
        pointRef.current = undefined
      }
    } else {
      countRef.current = 1
      pointRef.current = {
        x: event.clientX,
        y: event.clientY
      }
    }

    const waitForClick = cancellablePromise(delay(500));
    api.appendPendingPromise(waitForClick);

    return waitForClick.promise
      .then(() => {
        api.removePendingPromise(waitForClick);
        if(onClick) onClick(event);
        pointRef.current = undefined
      })
      .catch((errorInfo) => {
        api.removePendingPromise(waitForClick);
        if (!errorInfo.isCanceled) {
          throw errorInfo.error;
        }
      });
  };

  return [ handleMultipleClick ];
};

export default useMultipleClick;
