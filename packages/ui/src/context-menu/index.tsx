import React, { useLayoutEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import Align from 'rc-align'
import { TargetType } from 'rc-align/lib/interface'
import { getPrefixCls } from '../utils'

export interface ContextMenuProps {
  getContainer?: () => HTMLElement
}

const prefixCls = getPrefixCls('context-menu')

export const ContextMenu: React.FC<ContextMenuProps> = ({ getContainer = () => document.body, children }) => { 

  const container = useRef<HTMLElement | null>(null)
  const [target, setTarget] = useState<TargetType | null>(null) 

  useLayoutEffect(() => { 
    const el = getContainer()

    const close = () => {
      setTarget(null)
    }

    const handleMouseDown = (e: MouseEvent) => {
      const visible = e.button === 2
      if(visible) {
        e.preventDefault()
      }
      setTarget(visible ? {
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
      } : null)
    }

    el.addEventListener('mousedown', handleMouseDown)
    if(el !== document.body) { 
      window.addEventListener('mousedown', close)
    }
    container.current = el
    return () => { 
      el.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousedown', close)
    }
  }, [getContainer])

  const Menu = () => { 
    if(!target) return null
    return (
      <Align align={{}} target={target}>
        <div className={prefixCls}>

        </div>
      </Align>
    )
  }

  const render = () => {
    if(!target || !container.current) return null
    ReactDOM.createPortal(<Menu />, container.current)
  }

  return <>
    {
      children
    }
    {
      render()
    }
  </>
}