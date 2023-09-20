import { createCancellable, createCancellablePromiseCollection } from './cancellable-promises';
import { getPrimaryEvent } from './event';

export const createMultipleClickHandler = (options: {
  onClick?: (event: MouseEvent) => void;
  onMultipleClick: (event: MouseEvent, count: number) => boolean | void;
}) => {
  const { onClick, onMultipleClick } = options;
  const api = createCancellablePromiseCollection();
  let startPoint: { x: number; y: number } | null = null;
  let clickCount = 0;

  const isWithinThreshold = (event: MouseEvent | TouchEvent | Touch, threshold = 10) => {
    const ev = getPrimaryEvent(event);
    return startPoint
      ? Math.abs(ev.clientY - startPoint.y) < threshold && Math.abs(ev.clientX - startPoint.x) < threshold
      : false;
  };

  const clearState = () => {
    api.clear();
    startPoint = null;
    clickCount = 0;
  };

  const handleMultipleClick = (event: MouseEvent) => {
    if (event.button === 2) return;
    const startPointExists = startPoint;
    if (startPointExists) {
      if (isWithinThreshold(event)) {
        api.clear();
        clickCount += 1;
        if (onMultipleClick(event, clickCount) === false) {
          clearState();
          return;
        }
      } else {
        clearState();
      }
    } else {
      clickCount = 1;
      startPoint = {
        x: event.clientX,
        y: event.clientY,
      };
    }
    if (clickCount === 1 && onMultipleClick(event, 1) === false) {
      clearState();
    } else {
      const waitForClick = createCancellable(api.delay(500));
      api.add(waitForClick);
      return waitForClick.promise
        .then(() => {
          api.delete(waitForClick);
          if (onClick) onClick(event);
          startPoint = null;
        })
        .catch((errorInfo) => {
          api.delete(waitForClick);
          if (!errorInfo.isCanceled) {
            throw errorInfo.error;
          }
        });
    }
  };

  return { handleMultipleClick, isWithinThreshold };
};
