import { useRef } from 'rezon';
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect';

export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
