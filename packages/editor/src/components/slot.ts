import { useSlotComponents } from '../hooks/use-slot'
import { c } from 'rezon'
import { repeat } from 'rezon/directives/repeat'

export const Slots = c(() => {
  const slots = useSlotComponents()
  return repeat(
    slots,
    (_, index) => index,
    solt => solt.component(solt.props),
  )
}, true)
