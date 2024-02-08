const prefix = 'component'
const phaseSymbol = Symbol(`${prefix}.phase`)
const hookSymbol = Symbol(`${prefix}.hook`)

const updateSymbol = Symbol(`${prefix}.update`)
const commitSymbol = Symbol(`${prefix}.commit`)
const effectsSymbol = Symbol(`${prefix}.effects`)
const layoutEffectsSymbol = Symbol(`${prefix}.layoutEffects`)

type EffectsSymbols = typeof effectsSymbol | typeof layoutEffectsSymbol
type Phase = typeof updateSymbol | typeof commitSymbol | typeof effectsSymbol

const contextEvent = 'component.context'

export {
  phaseSymbol,
  hookSymbol,
  updateSymbol,
  commitSymbol,
  effectsSymbol,
  layoutEffectsSymbol,
  contextEvent,
}
export type { Phase, EffectsSymbols }
