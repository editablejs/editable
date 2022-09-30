import * as React from 'react'

/* -------------------------------------------------------------------------------------------------
 * Arrow
 * -----------------------------------------------------------------------------------------------*/

const NAME = 'Arrow'

type ArrowElement = React.ElementRef<'svg'>
type PrimitiveSvgProps = React.ComponentPropsWithoutRef<'svg'>
interface ArrowProps extends PrimitiveSvgProps {}

const Arrow = React.forwardRef<ArrowElement, ArrowProps>((props, forwardedRef) => {
  const { children, width = 10, height = 5, ...arrowProps } = props
  return (
    <svg
      {...arrowProps}
      ref={forwardedRef}
      width={width}
      height={height}
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
    >
      {children || <polygon points="0,0 30,0 15,10" />}
    </svg>
  )
})

Arrow.displayName = NAME

/* -----------------------------------------------------------------------------------------------*/

const Root = Arrow

export {
  Arrow,
  //
  Root,
}
export type { ArrowProps }
