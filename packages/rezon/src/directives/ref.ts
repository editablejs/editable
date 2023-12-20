import { nothing } from '../lit-html/html'
import { ref as _ref } from '../lit-html/directives/ref'
import { Ref } from '../use-ref'

const REF_TO_FUNCTION_WEAKMAP = new WeakMap<
  NonNullable<Ref<Element>>,
  (element: Element | undefined) => void
>()
export const ref = <T extends Element = Element>(callback?: Ref<T>) => {
  if (callback) {
    let refToFunction = REF_TO_FUNCTION_WEAKMAP.get(callback)
    if (!refToFunction) {
      refToFunction = (element: Element | undefined) => {
        const elementOrNull = element ?? null
        if (typeof callback === 'function') {
          callback(elementOrNull as T)
        } else if (callback) callback.current = elementOrNull as T
      }
      REF_TO_FUNCTION_WEAKMAP.set(callback, refToFunction)
    }
    return _ref(refToFunction)
  }

  return nothing
}
