
import { HTMLAttributes, html, nothing, useRef, useState, c } from 'rezon'
import { spread } from 'rezon/directives/spread'
import { when } from 'rezon/directives/when'
import tw, { TwStyle, css } from 'twin.macro'

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

interface StyledHolderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  className?: string | TwStyle
}

const StyledHolder = c<StyledHolderProps>(({ className, ...props }) => {

  return html`<div class=${css([
    tw`absolute w-3 h-3 border-2 border-white rounded-full cursor-nwse-resize bg-primary pointer-events-auto z-[1]`,
    className
  ])} ${spread(props)}></div>`
})

export const Resizer = c<ResizerProps>(({
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
  const pointRef = useRef({ x: 0, y: 0 })
  const holdreRef = useRef<ResizerHolder>('top-left')
  const [size, setSize] = useState({ width: 0, height: 0 })
  const sizeRef = useRef(size)
  const [resizing, setResizing] = useState(false)
  const rateRef = useRef(1)
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseDown = (event: MouseEvent, holder: ResizerHolder) => {
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

  return html`<div class=${css([
    tw`absolute left-0 top-0 right-0 bottom-0 w-full h-full pointer-events-none outline-1 outline outline-primary`,
    css`
          line-height: 0;
        `,
    className
  ])}>${when(holders.includes('top-left'), () => StyledHolder({
    className: tw`-top-1.5 -left-1.5 cursor-nwse-resize bg-primary`,
    onMouseDown: e => handleMouseDown(e, 'top-left'),
  }))
    }${when(holders.includes('top-right'), () => StyledHolder({
      className: tw`absolute -top-1.5 -right-1.5 cursor-nesw-resize bg-primary`,
      onMouseDown: e => handleMouseDown(e, 'top-right'),
    }))
    }${when(holders.includes('bottom-left'), () => StyledHolder({
      className: tw`absolute -bottom-1.5 -left-1.5 cursor-nesw-resize bg-primary `,
      onMouseDown: e => handleMouseDown(e, 'bottom-left'),
    }))
    }${when(holders.includes('bottom-right'), () => StyledHolder({
      className: tw`absolute -bottom-1.5 -right-1.5 cursor-nwse-resize bg-primary`,
      onMouseDown: e => handleMouseDown(e, 'bottom-right'),
    }))
    }<div class=${css([
      tw`absolute right-2 top-2 bg-gray-900 text-white px-1 py-0.5 rounded text-sm hidden w-max`,
      css`
            line-height: normal;
          `,
      resizing && tw`block`,
    ])}>${`${size.width} x ${size.height}`}</div>${previewImage ? html`<img
          alt=""
          src=${previewImage}
          class=${tw`absolute block left-0 top-0 w-full h-full opacity-30 pointer-events-none z-0`}
        />` : nothing
    }</div>`
})
