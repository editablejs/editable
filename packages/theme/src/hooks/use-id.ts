import { useState } from 'rezon'
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'

let count = 0

function useId(deterministicId?: string): string {
  const [id, setId] = useState<string | undefined>(undefined)

  useIsomorphicLayoutEffect(() => {
    if (!deterministicId) setId(reactId => reactId ?? String(count++))
  }, [deterministicId])
  return deterministicId || (id ? `ea-ui-${id}` : '')
}

export { useId }
