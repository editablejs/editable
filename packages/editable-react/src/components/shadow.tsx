import React, { useState } from "react"
import ReactDOM from "react-dom";
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

export interface DrawRect {
  left: number
  top: number
  width: number
  height: number
  color?: string
  children?: React.ReactNode
}

export function ShadowContent({ root, children }: { root: ShadowRoot, children: React.ReactNode }) {
  return ReactDOM.createPortal(children, root);
}

export const ShadowBox: React.FC<{ rect: DrawRect} & React.HTMLAttributes<HTMLDivElement>> = ({ children, rect, style, ...props }) => (
  <div style={{ 
    position: 'absolute', 
    top: 0, left: 0, 
    width: rect.width, height: rect.height, 
    transform: `translateX(${rect.left || 0}px) translateY(${rect.top || 0}px)`,
    opacity: 1,
    backgroundColor: `${rect.color || 'transparent'}`,
    zIndex: 1,
    ...style
  }} {...props}>{ children }</div>
)

interface ShadowProps {
  caretRects: DrawRect[] 
  boxRects: DrawRect[]
  children?: React.ReactNode
}

const Shadow: React.FC<ShadowProps> = ({ caretRects, boxRects, children }) => {
  const [ shadow, setShadow ] = useState<HTMLDivElement | null>(null)
  const [ root, setRoot ] = useState<ShadowRoot>()

  useIsomorphicLayoutEffect(() => {
    const shadow = document.createElement('div')
    shadow.setAttribute('style', 'position: "absolute"; z-index: 2, top: 0px')
    document.body.appendChild(shadow)
    const root = shadow.attachShadow({mode: 'open'})
    setShadow(shadow)
    setRoot(root)
    return () => {
      document.body.removeChild(shadow)
    }
  }, [])

  useIsomorphicLayoutEffect(() => {
    if(!root || !shadow) return
    ReactDOM.render(<ShadowContent root={root} >
      <div style={{ pointerEvents: 'none' }}>
        {caretRects.map((rect) => <ShadowBox rect={Object.assign({}, rect, {width: Math.max(rect.width || 1, 1)})} style={{ willChange: 'opacity, transform' }}/>)}
        {boxRects.map((rect) => <ShadowBox rect={rect} style={{ willChange: 'transform' }} />)}
        { children }
      </div>
      </ShadowContent>, shadow)
  }, [caretRects, boxRects, shadow, root])

  return null
}

export default Shadow