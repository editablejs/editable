const prefix = 'component'
const phaseSymbol = Symbol(`${prefix}.phase`)

const updateSymbol = Symbol(`${prefix}.update`)
const commitSymbol = Symbol(`${prefix}.commit`)
const effectsSymbol = Symbol(`${prefix}.effects`)
const layoutEffectsSymbol = Symbol(`${prefix}.layoutEffects`)

type EffectsSymbols = typeof effectsSymbol | typeof layoutEffectsSymbol
type Phase = typeof updateSymbol | typeof commitSymbol | typeof effectsSymbol

const contextEvent = `${prefix}.context`

export {
  phaseSymbol,
  updateSymbol,
  commitSymbol,
  effectsSymbol,
  layoutEffectsSymbol,
  contextEvent,
}
export type { Phase, EffectsSymbols }
