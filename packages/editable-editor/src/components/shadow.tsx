import React, { useState, forwardRef, useImperativeHandle } from "react"
import ReactDOM from "react-dom";
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

export interface DrawRect {
  left: number
  top: number
  width: number
  height: number
  color?: string
  style?: React.CSSProperties
}

type ShadowBoxProps = { 
  rect: DrawRect
} & React.HTMLAttributes<HTMLDivElement>

export function ShadowContent({ root, children }: { root: ShadowRoot, children: React.ReactNode }) {
  return ReactDOM.createPortal(children, root);
}

export const ShadowBox: React.FC<ShadowBoxProps & React.RefAttributes<HTMLDivElement>> = forwardRef<HTMLDivElement, ShadowBoxProps>(({ children, rect, style, ...props }, ref) => (
  <div 
  ref={ref}
  style={{ 
    position: 'absolute', 
    top: 0, left: 0, 
    width: rect.width, height: rect.height, 
    transform: `translateX(${rect.left || 0}px) translateY(${rect.top || 0}px)`,
    opacity: 1,
    backgroundColor: `${rect.color || 'transparent'}`,
    zIndex: 1,
    ...style
  }} {...props}>{ children }</div>
))

ShadowBox.displayName = 'ShadowBox'

interface ShadowProps {
  children?: React.ReactNode
}

const Shadow: React.FC<ShadowProps & React.RefAttributes<ShadowRoot>> = forwardRef<ShadowRoot, ShadowProps>(({ children }, ref) => {
  const [ shadow, setShadow ] = useState<HTMLDivElement | null>(null)
  const [ root, setRoot ] = useState<ShadowRoot>()

  useIsomorphicLayoutEffect(() => {
    const shadow = document.createElement('div')
    shadow.setAttribute('style', 'position: "absolute"; z-index: 2, top: 0px')
    shadow.setAttribute('data-slate-shadow', 'true')
    document.body.appendChild(shadow)
    const root = shadow.attachShadow({mode: 'open'})
    setShadow(shadow)
    setRoot(root)
    return () => {
      document.body.removeChild(shadow)
    }
  }, [])

  useImperativeHandle(ref, () => root!, [root])

  useIsomorphicLayoutEffect(() => {
    if(!root || !shadow) return
    ReactDOM.render(<ShadowContent root={root} >
      <div style={{ pointerEvents: 'none' }}>
        { children }
      </div>
      </ShadowContent>, shadow)
  }, [shadow, root, children])

  return null
})

Shadow.displayName = "Shadow"

export default Shadow