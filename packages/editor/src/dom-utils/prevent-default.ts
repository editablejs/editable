export function preventDefault<T extends Event>(fn: <R extends unknown = unknown>(event: T) => R) {
  return function (event: T) {
    event.preventDefault();
    // @ts-ignore
    return fn.call(this, event);
  };
}
