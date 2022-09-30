import * as React from 'react'
import ReactDOM from 'react-dom'

/* -------------------------------------------------------------------------------------------------
 * Portal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'Portal'

type PortalElement = React.ElementRef<'div'>
type PrimitiveDivProps = React.ComponentPropsWithoutRef<'div'>
interface PortalProps extends PrimitiveDivProps {
  container?: HTMLElement | null
}

const Portal = React.forwardRef<PortalElement, PortalProps>((props, forwardedRef) => {
  const { container = globalThis?.document?.body, ...portalProps } = props
  return container
    ? ReactDOM.createPortal(<div {...portalProps} ref={forwardedRef} />, container)
    : null
})

Portal.displayName = PORTAL_NAME

/* -----------------------------------------------------------------------------------------------*/

const Root = Portal

export {
  Portal,
  //
  Root,
}
export type { PortalProps }
