export function stopPropagation<T extends Event>(fn: (event: T) => unknown) {
  return function (event: T) {
    event.stopPropagation();
    // @ts-ignore
    return fn.call(this, event);
  };
}
