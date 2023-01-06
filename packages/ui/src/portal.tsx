import * as React from 'react'
import ReactDOM from 'react-dom'
import { Root } from './root'

/* -------------------------------------------------------------------------------------------------
 * Portal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'Portal'

type PortalElement = React.ElementRef<typeof Root.div>
type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Root.div>
interface Portal extends PrimitiveDivProps {
  container?: HTMLElement | null
}

const Portal = React.forwardRef<PortalElement, Portal>((props, forwardedRef) => {
  const { container = globalThis?.document?.body, ...portalProps } = props
  const children = <Root.div {...portalProps} ref={forwardedRef} />
  return container ? ReactDOM.createPortal(children, container) : children
})

Portal.displayName = PORTAL_NAME

export { Portal }
