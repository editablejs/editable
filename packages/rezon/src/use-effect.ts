import { effectsSymbol } from './symbols'
import { createEffect } from './create-effect'

/**
 * @function
 * @param {() => void} effect - callback function that runs each time dependencies change
 * @param {unknown[]} [dependencies] - list of dependencies to the effect
 * @return {void}
 */
const useEffect = createEffect(effectsSymbol)

export { useEffect }
