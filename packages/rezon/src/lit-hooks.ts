import { html, render, svg, nothing } from './lit-html/html'
import create from './core'
import {
  virtual,
  VirtualDirectiveResult,
  VirtualResult,
  isVaildVirtual,
  isTemplateStringsResult,
  getVaildVirtualFromTemplateResult,
  getVirtualResultProps,
  VirtualDirectiveComponent,
} from './virtual'
import { createContext, Context } from './create-context'
import { createPortal } from './create-portal'

const { define, custom } = create({ render })

export type { Context, VirtualDirectiveResult, VirtualResult, VirtualDirectiveComponent }
export {
  custom,
  createContext,
  createPortal,
  virtual,
  html,
  svg,
  render,
  nothing,
  define,
  isVaildVirtual,
  isTemplateStringsResult,
  getVaildVirtualFromTemplateResult,
  getVirtualResultProps,
}
