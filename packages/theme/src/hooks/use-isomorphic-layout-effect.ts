import { useLayoutEffect, useEffect } from "rezon";

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' && typeof window.document !== 'undefined'
    ? useLayoutEffect
    : useEffect
