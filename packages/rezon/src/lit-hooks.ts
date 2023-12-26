import { html, render, svg, nothing } from './lit-html/html'
import {
  c,
  component,
  ComponentDirective,
  ComponentValue,
  isVaildComponent,
  isTemplateStringsValue,
  getVaildComponentFromTemplateValue,
  getPropsFromComponentValue,
} from './component'
import { createContext, Context } from './create-context'
import { createPortal } from './create-portal'

export type { Context, ComponentDirective, ComponentValue }
export {
  createContext,
  createPortal,
  c,
  component,
  html,
  svg,
  render,
  nothing,
  isVaildComponent,
  isTemplateStringsValue,
  getVaildComponentFromTemplateValue,
  getPropsFromComponentValue,
}
