import { layoutEffectsSymbol } from './symbols'
import { createEffect } from './create-effect'

/**
 * @function
 * @param  {Effect} callback effecting callback
 * @param  {unknown[]} [values] dependencies to the effect
 * @return {void}
 */
const useLayoutEffect = createEffect(layoutEffectsSymbol)

export { useLayoutEffect }
