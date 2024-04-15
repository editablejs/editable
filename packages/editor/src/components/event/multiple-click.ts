import { Range, Editor } from "@/interfaces";
import { isDOMNode, listen, retrieveMainEvent } from "@/dom-utils";
import { attachEvent } from "./editor";


const DOUBLE_CLICK_THRESHOLD = 500
interface CancellablePromise<T> {
  promise: Promise<T>;
  cancel: () => void;
}

const createCancellable = <T>(promise: Promise<T>): CancellablePromise<T> => {
  let isCanceled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise.then(
      (value) => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
      (error) => reject({ isCanceled, error })
    );
  });

  return {
    promise: wrappedPromise,
    cancel: () => (isCanceled = true),
  };
};

const noop = () => { };

const delay = (n: number) => new Promise<void>((resolve) => setTimeout(resolve, n));

const createCancellablePromiseCollection = <T>() => {
  const cancellablePromises: { current: CancellablePromise<T>[] } = {
    current: [] as CancellablePromise<T>[],
  };

  const add = (cancellablePromise: CancellablePromise<T>) =>
    (cancellablePromises.current = [...cancellablePromises.current, cancellablePromise]);

  const deletePromise = (cancellablePromise: CancellablePromise<T>) =>
    (cancellablePromises.current = cancellablePromises.current.filter((p) => p !== cancellablePromise));

  const clear = () => cancellablePromises.current.map((p) => p.cancel());

  return {
    cancellablePromises,
    add,
    delete: deletePromise,
    clear,
    delay,
    noop,
  };
};

const createMultipleClickHandler = (options: {
  onClick?: (event: MouseEvent) => void;
  onMultipleClick: (event: MouseEvent, count: number) => boolean | void;
}) => {
  const { onClick, onMultipleClick } = options;
  const api = createCancellablePromiseCollection();
  let startPoint: { x: number; y: number } | null = null;
  let clickCount = 0;

  const isWithinThreshold = (event: MouseEvent | TouchEvent | Touch, threshold = 10) => {
    const ev = retrieveMainEvent(event);
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


const EDITOR_TO_DOUBLE_CLICK = new WeakMap<Editor, boolean>()

const EDITOR_TO_DOUBLE_CLICK_WITHIN_THRESHOLD_FUNCTION = new WeakMap<Editor, (event: MouseEvent | TouchEvent | Touch) => boolean>()

export const isDoubleClick = (editor: Editor) => {
  return EDITOR_TO_DOUBLE_CLICK.get(editor) || false
}

export const isDoubleClickWithinThreshold = (editor: Editor, event: MouseEvent | TouchEvent | Touch) => {
  const isWithinThreshold = EDITOR_TO_DOUBLE_CLICK_WITHIN_THRESHOLD_FUNCTION.get(editor)
  return isWithinThreshold ? isWithinThreshold(event) : false
}

export const setDoubleClick = (editor: Editor, value: boolean) => {
  EDITOR_TO_DOUBLE_CLICK.set(editor, value)
}

export const createMultipleClickEvent = (editor: Editor, container: HTMLElement) => {

  let doublueClickTimer: number | null = null

  const { handleMultipleClick, isWithinThreshold } = createMultipleClickHandler({
    onClick: () => {
      setDoubleClick(editor, false)
    },

    onMultipleClick: (event, count) => {
      const { selection } = editor
      if (!selection || event.defaultPrevented) return
      event.preventDefault()
      const container = Editor.getDOMNode(editor, editor)
      if (isDOMNode(event.target) && !container.contains(event.target)) return
      const isCollapsed = Range.isCollapsed(selection)
      if (count === 1 && !isCollapsed) {
        return false
      } else if (count === 2) {
        editor.selectWord()
        setDoubleClick(editor, true)
        if (doublueClickTimer) clearTimeout(doublueClickTimer)
        doublueClickTimer = setTimeout(() => {
          setDoubleClick(editor, false)
        }, DOUBLE_CLICK_THRESHOLD)
        return
      } else if (count === 3) {
        editor.selectLine()
        setDoubleClick(editor, false)
        return false
      }
    },
  })
  EDITOR_TO_DOUBLE_CLICK_WITHIN_THRESHOLD_FUNCTION.set(editor, isWithinThreshold)
  attachEvent(editor, listen(container, 'click', handleMultipleClick))
}
