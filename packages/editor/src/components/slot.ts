import { useSlotComponents } from '../hooks/use-slot'
import { virtual } from 'rezon'
import { repeat } from 'rezon/directives/repeat'

export const Slots = virtual(() => {
  const slots = useSlotComponents()
  return repeat(
    slots,
    (_, index) => index,
    solt => solt.component(solt.props),
  )
}, true)
