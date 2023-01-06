import React, { useRef } from 'react'
import { FC } from 'react'
import tw, { css } from 'twin.macro'

export interface ResizerProps {
  onResize?: (width: number, height: number) => void
  onChange?: (width: number, height: number) => void
  maxWidth?: number
  maxHeight?: number
  minWidth?: number
  minHeight?: number
  previewImage?: string
  holders?: ResizerHolder[]
  className?: string
}

export type ResizerHolder = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const StyledHolder = tw.div`absolute w-3 h-3 border-2 border-white rounded-full cursor-nwse-resize bg-primary pointer-events-auto z-[1]`

export const Resizer: FC<ResizerProps> = ({
  onResize,
  onChange,
  maxHeight,
  maxWidth,
  minHeight = 10,
  minWidth = 10,
  previewImage,
  holders = ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  className,
}) => {
  const pointRef = React.useRef({ x: 0, y: 0 })
  const holdreRef = React.useRef<ResizerHolder>('top-left')
  const [size, setSize] = React.useState({ width: 0, height: 0 })
  const sizeRef = React.useRef(size)
  const [resizing, setResizing] = React.useState(false)
  const rateRef = React.useRef(1)
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, holder: ResizerHolder) => {
    event.preventDefault()

    pointRef.current = {
      x: event.clientX,
      y: event.clientY,
    }
    holdreRef.current = holder
    const el = ref.current!
    const { width, height } = el.getBoundingClientRect()
    setSize({
      width,
      height,
    })
    sizeRef.current = {
      width,
      height,
    }
    setResizing(true)
    rateRef.current = height / width

    el.style.top = ~['top-left', 'top-right'].indexOf(holder) ? 'auto' : '0'
    el.style.left = ~['top-left', 'bottom-left'].indexOf(holder) ? 'auto' : '0'
    el.style.right = ~['top-right', 'bottom-right'].indexOf(holder) ? 'auto' : '0'
    el.style.bottom = ~['bottom-left', 'bottom-right'].indexOf(holder) ? 'auto' : '0'

    if ('ontouchstart' in document.documentElement)
      window.addEventListener('touchmove', handleMouseMove)
    else window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (event: MouseEvent | TouchEvent) => {
    let x = 0,
      y = 0
    if (event instanceof TouchEvent) {
      const touch = event.touches[0]
      x = touch.clientX
      y = touch.clientY
    } else {
      x = event.clientX
      y = event.clientY
    }
    const dx = pointRef.current.x - x
    let width = 0,
      height = 0
    if (~['top-right', 'bottom-right'].indexOf(holdreRef.current)) {
      width = sizeRef.current.width - dx
    } else {
      width = sizeRef.current.width + dx
    }
    width = Math.max(width, minWidth)
    width = maxWidth ? Math.min(width, maxWidth) : width
    height = Math.round(rateRef.current * width)

    height = Math.max(height, minHeight)
    height = maxHeight ? Math.min(height, maxHeight) : height
    if (ref.current) {
      ref.current.style.width = `${width}px`
      ref.current.style.height = `${height}px`
    }
    setSize({
      width,
      height,
    })
    if (onResize) onResize(width, height)
  }

  const handleMouseUp = (event: MouseEvent) => {
    event.preventDefault()
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('touchmove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
    const el = ref.current!
    if (onChange) {
      const { width, height } = el.getBoundingClientRect()
      onChange(width, height)
    }
    el.style.width = ''
    el.style.height = ''

    setResizing(false)
  }

  return (
    <div
      ref={ref}
      css={[
        tw`absolute left-0 top-0 right-0 bottom-0 w-full h-full pointer-events-none outline-1 outline outline-primary`,
        css`
          line-height: 0;
        `,
      ]}
      className={className}
    >
      {holders.includes('top-left') && (
        <StyledHolder
          tw="-top-1.5 -left-1.5 cursor-nwse-resize bg-primary"
          onMouseDown={e => handleMouseDown(e, 'top-left')}
        />
      )}
      {holders.includes('top-right') && (
        <StyledHolder
          tw="absolute -top-1.5 -right-1.5 cursor-nesw-resize bg-primary"
          onMouseDown={e => handleMouseDown(e, 'top-right')}
        />
      )}
      {holders.includes('bottom-left') && (
        <StyledHolder
          tw="absolute -bottom-1.5 -left-1.5 cursor-nesw-resize bg-primary "
          onMouseDown={e => handleMouseDown(e, 'bottom-left')}
        />
      )}
      {holders.includes('bottom-right') && (
        <StyledHolder
          tw="absolute -bottom-1.5 -right-1.5 cursor-nwse-resize bg-primary"
          onMouseDown={e => handleMouseDown(e, 'bottom-right')}
        />
      )}
      <div
        css={[
          tw`absolute right-2 top-2 bg-gray-900 text-white px-1 py-0.5 rounded text-sm hidden w-max`,
          css`
            line-height: normal;
          `,
          resizing && tw`block`,
        ]}
      >{`${size.width} x ${size.height}`}</div>
      {previewImage && (
        <img
          alt=""
          src={previewImage}
          tw="absolute block left-0 top-0 w-full h-full opacity-30 pointer-events-none z-0"
        />
      )}
    </div>
  )
}
