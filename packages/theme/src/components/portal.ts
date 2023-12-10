


/* -------------------------------------------------------------------------------------------------
 * Portal
 * -----------------------------------------------------------------------------------------------*/

import { HTMLAttributes, createPortal, html, virtual } from "rezon"
import { spread } from "rezon/directives/spread"
import { when } from "rezon/directives/when"

export interface PortalProps extends HTMLAttributes<HTMLDivElement> {
  container?: HTMLElement | null
}

const Portal = virtual<PortalProps>((props) => {
  const { container = globalThis?.document?.body, ...portalProps } = props
  const children = html`<div ${spread(portalProps)}></div>`
  return when(container, (container) => createPortal({ container, children }), () => children)
})

export { Portal }
