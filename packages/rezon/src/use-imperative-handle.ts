import { useLayoutEffect } from './use-layout-effect'
import { Ref } from './use-ref'

export function useImperativeHandle<T>(
  ref: Ref<T> | undefined,
  createHandle: () => T,
  args?: unknown[],
) {
  useLayoutEffect(
    () => {
      if (typeof ref == 'function') {
        ref(createHandle())
        return () => ref(null)
      } else if (ref) {
        ref.current = createHandle()
        return () => (ref.current = null)
      }
    },
    args == null ? args : args.concat(ref),
  )
}
