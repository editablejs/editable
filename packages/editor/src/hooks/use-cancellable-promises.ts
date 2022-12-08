import * as React from 'react'

export interface CellablePromise<T> {
  promise: Promise<T>
  cancel: () => void
}

const cancellablePromise = <T>(promise: Promise<T>) => {
  let isCanceled = false

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      value => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
      error => reject({ isCanceled, error }),
    )
  })

  return {
    promise: wrappedPromise,
    cancel: () => (isCanceled = true),
  }
}

const noop = () => {}

const delay = (n: number) => new Promise(resolve => setTimeout(resolve, n))

const useCancellablePromises = <T>() => {
  const pendingPromises = React.useRef<CellablePromise<T>[]>([])

  const appendPendingPromise = (promise: CellablePromise<T>) =>
    (pendingPromises.current = [...pendingPromises.current, promise])

  const removePendingPromise = (promise: CellablePromise<T>) =>
    (pendingPromises.current = pendingPromises.current.filter(p => p !== promise))

  const clearPendingPromises = () => pendingPromises.current.map(p => p.cancel())

  const api = {
    pendingPromises,
    appendPendingPromise,
    removePendingPromise,
    clearPendingPromises,
    delay,
    noop,
  }

  return api
}

export { useCancellablePromises, cancellablePromise }
