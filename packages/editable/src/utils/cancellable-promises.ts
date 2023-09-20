export interface CancellablePromise<T> {
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

const noop = () => {};

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

export { createCancellablePromiseCollection, createCancellable, noop, delay };
