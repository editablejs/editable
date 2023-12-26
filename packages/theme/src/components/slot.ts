
import { HTMLAttributes, ComponentDirective, c } from 'rezon'
import { mergeChildrenProps } from '@/utils'

/* -------------------------------------------------------------------------------------------------
 * Slot
 * -----------------------------------------------------------------------------------------------*/

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: unknown
}

const _Slot = c<SlotProps>((props) => {
  const { children, ref, ...slotProps } = props
  if (typeof children === 'function') {
    return children({ ...slotProps, ref })
  } else {
    mergeChildrenProps(children, {
      props: slotProps,
      ref,
    })
  }

  return children
})

const Slot = <P = SlotProps>(...args: Parameters<ComponentDirective<P>>) => (_Slot as ComponentDirective<P>)(...args)

/* ---------------------------------------------------------------------------------------------- */
export { Slot }
