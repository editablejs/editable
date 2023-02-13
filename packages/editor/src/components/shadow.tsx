import * as React from 'react'
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

type ShadowBlockProps = {
  rect: ShadowRect
} & React.HTMLAttributes<HTMLDivElement>

export const ShadowBlockDefault: React.FC<ShadowBlockProps & React.RefAttributes<HTMLDivElement>> =
  React.forwardRef<HTMLDivElement, ShadowBlockProps>(({ children, rect, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        // 数值为单数的情况下，两组重合位置会有阴影
        // transform: `translateX(${rect.left || 0}px) translateY(${rect.top || 0}px)`,
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

ShadowBlockDefault.displayName = 'ShadowBlock'

export const ShadowBlock = React.memo(ShadowBlockDefault, (prev, next) => {
  return (
    prev.rect.left === next.rect.left &&
    prev.rect.top === next.rect.top &&
    prev.rect.width === next.rect.width &&
    prev.rect.height === next.rect.height &&
    prev.rect.color === next.rect.color &&
    prev.children === next.children
  )
})

interface ShadowContainerProps {
  children?: React.ReactNode
}

const ShadowContainer: React.FC<ShadowContainerProps & React.RefAttributes<ShadowRoot>> =
  React.forwardRef<ShadowRoot, ShadowContainerProps>(({ children }, ref) => {
    const [root, setRoot] = React.useState<ShadowRoot>()
    const containerRef = React.useRef<HTMLDivElement>(null)

    useIsomorphicLayoutEffect(() => {
      if (!containerRef.current || containerRef.current.shadowRoot) return
      const root = containerRef.current.attachShadow({ mode: 'open' })
      setRoot(root)
    }, [])

    React.useImperativeHandle(ref, () => root!, [root])

    return (
      <div ref={containerRef} style={{ position: 'absolute', zIndex: 2, top: 0, left: 0 }}>
        {root &&
          ReactDOM.createPortal(<div style={{ pointerEvents: 'none' }}>{children}</div>, root)}
      </div>
    )
  })

ShadowContainer.displayName = 'Shadow'

export default ShadowContainer
