import * as React from 'react'
import { Root } from './root'

/* -------------------------------------------------------------------------------------------------
 * Arrow
 * -----------------------------------------------------------------------------------------------*/

const NAME = 'Arrow'

type ArrowElement = React.ElementRef<typeof Root.svg>
type PrimitiveSvgProps = React.ComponentPropsWithoutRef<typeof Root.svg>
interface Arrow extends PrimitiveSvgProps {}

const Arrow = React.forwardRef<ArrowElement, Arrow>((props, forwardedRef) => {
  const { children, width = 10, height = 5, ...arrowProps } = props
  return (
    <Root.svg
      {...arrowProps}
      ref={forwardedRef}
      width={width}
      height={height}
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
    >
      {children || <polygon points="0,0 30,0 15,10" />}
    </Root.svg>
  )
})

Arrow.displayName = NAME

export { Arrow }
