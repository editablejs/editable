import React, { useState, forwardRef, useImperativeHandle } from 'react'
import ReactDOM from 'react-dom'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'

export interface ShadowRect {
  left: number
  top: number
  width: number
  height: number
  color?: string
  style?: React.CSSProperties
}

type ShadowRectProps = {
  rect: ShadowRect
} & React.HTMLAttributes<HTMLDivElement>

export const ShadowRectDefault: React.FC<ShadowRectProps & React.RefAttributes<HTMLDivElement>> =
  forwardRef<HTMLDivElement, ShadowRectProps>(({ children, rect, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: rect.width,
        height: rect.height,
        transform: `translateX(${rect.left || 0}px) translateY(${rect.top || 0}px)`,
        opacity: 1,
        backgroundColor: `${rect.color || 'transparent'}`,
        zIndex: 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  ))

ShadowRectDefault.displayName = 'ShadowRect'

export const ShadowRect = React.memo(ShadowRectDefault, (prev, next) => {
  return (
    prev.rect.left === next.rect.left &&
    prev.rect.top === next.rect.top &&
    prev.rect.width === next.rect.width &&
    prev.rect.height === next.rect.height &&
    prev.rect.color === next.rect.color
  )
})

interface ShadowProps {
  children?: React.ReactNode
}

const Shadow: React.FC<ShadowProps & React.RefAttributes<ShadowRoot>> = forwardRef<
  ShadowRoot,
  ShadowProps
>(({ children }, ref) => {
  const [root, setRoot] = useState<ShadowRoot>()

  useIsomorphicLayoutEffect(() => {
    const shadow = document.createElement('div')
    shadow.setAttribute('style', 'position: "absolute"; z-index: 2, top: 0px')
    shadow.setAttribute('data-slate-shadow', 'true')
    document.body.appendChild(shadow)
    const root = shadow.attachShadow({ mode: 'open' })
    setRoot(root)
    return () => {
      document.body.removeChild(shadow)
    }
  }, [])

  useImperativeHandle(ref, () => root!, [root])

  return root
    ? ReactDOM.createPortal(<div style={{ pointerEvents: 'none' }}>{children}</div>, root)
    : null
})

Shadow.displayName = 'Shadow'

export default Shadow
